const Admin = require('../models/Admin');
const Entry = require('../models/Entry');
const Profile = require('../models/Profile');
const limiter = require('../middleware/loginLimiter');
const { youtubeId } = require('../utils/helpers');
const { removeUpload, discardUploaded } = require('../utils/files');

const promisify = (fn) => new Promise((ok, fail) => fn((e) => (e ? fail(e) : ok())));

/* ---------- Login / logout ---------- */
exports.loginForm = (req, res) => {
  if (req.session.admin) return res.redirect('/admin');
  res.render('admin/login', { title: 'Log in' });
};

exports.login = async (req, res) => {
  const { username = '', password = '' } = req.body;
  const admin = await Admin.findOne({ username: username.trim() });
  if (!admin || !(await admin.check(password))) {
    limiter.fail(req.ip);
    return res.status(401).render('admin/login', { title: 'Log in', error: 'Wrong username or password.' });
  }
  limiter.reset(req.ip);
  const returnTo = req.session.returnTo || '/admin';
  await promisify((cb) => req.session.regenerate(cb)); // session fixation'dan himoya
  req.session.admin = { id: admin._id.toString(), username: admin.username };
  await promisify((cb) => req.session.save(cb));
  res.redirect(returnTo);
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
};

/* ---------- Dashboard ---------- */
exports.dashboard = async (req, res) => {
  const rows = await Entry.aggregate([{ $group: { _id: '$section', n: { $sum: 1 } } }]);
  const counts = Object.fromEntries(rows.map((r) => [r._id, r.n]));
  res.render('admin/dashboard', { title: 'Dashboard', counts });
};

/* ---------- Profile ---------- */
exports.profileForm = (req, res) => res.render('admin/profile', { title: 'Profile' });

exports.profileUpdate = async (req, res) => {
  const profile = await Profile.getOne();
  const b = req.body;
  const data = {
    fullName: (b.fullName || '').trim(),
    logoText: (b.logoText || '').trim(),
    metaDescription: (b.metaDescription || '').trim(),
    heroEyebrow: (b.heroEyebrow || '').trim(),
    heroTitle: (b.heroTitle || '').trim(),
    heroAccentLine: Math.max(0, parseInt(b.heroAccentLine, 10) || 0),
    heroText: (b.heroText || '').trim(),
    aboutText: (b.aboutText || '').trim(),
    quote: (b.quote || '').trim(),
    footerText: (b.footerText || '').trim(),
  };

  if (!data.fullName || !data.logoText || !data.heroTitle) {
    discardUploaded(req);
    return res.status(400).render('admin/profile', {
      title: 'Profile',
      profile: { ...profile.toObject(), ...data },
      flash: { type: 'error', text: 'Full name, logo text and headline are required.' },
    });
  }

  if (req.file) {
    removeUpload(profile.portrait);
    data.portrait = '/uploads/' + req.file.filename;
  } else if (b.removePortrait === '1') {
    removeUpload(profile.portrait);
    data.portrait = '';
  }

  profile.set(data);
  await profile.save();
  req.flash('success', 'Profile saved.');
  res.redirect('/admin/profile');
};

/* ---------- Entries (5 ta bo'lim uchun umumiy CRUD) ---------- */
function pickFields(section, b) {
  const data = {
    title: (b.title || '').trim(),
    summary: (b.summary || '').trim(),
    content: b.content || '',
    videoUrl: (b.videoUrl || '').trim(),
    order: parseInt(b.order, 10) || 0,
    published: b.published === '1',
  };
  if (section.tags.length) data.tag = section.tags.includes(b.tag) ? b.tag : section.tags[0];
  if (section.hasYear) data.year = (b.year || '').trim();
  if (section.hasDate) data.date = b.date ? new Date(b.date) : null;
  if (section.hasLink) data.link = (b.link || '').trim();
  return data;
}

function validate(data) {
  if (!data.title) return 'Title is required.';
  if (data.year === '') return 'Year is required.';
  if (data.date && isNaN(data.date)) return 'Date is not valid.';
  if (data.videoUrl && !youtubeId(data.videoUrl)) return 'That does not look like a YouTube link.';
  if (data.link && !/^https?:\/\//i.test(data.link)) return 'External link must start with http:// or https://';
  return null;
}

const formError = (res, section, entry, text) =>
  res.status(400).render('admin/form', { title: section.label, section, entry, flash: { type: 'error', text } });

exports.list = async (req, res) => {
  const section = req.section;
  const entries = await Entry.find({ section: section.key }).sort({ order: 1, createdAt: -1 }).lean();
  res.render('admin/list', { title: section.label, section, entries });
};

exports.newForm = (req, res) =>
  res.render('admin/form', { title: req.section.label, section: req.section, entry: null });

exports.create = async (req, res) => {
  const section = req.section;
  const data = pickFields(section, req.body);
  const error = validate(data);
  if (error) {
    discardUploaded(req);
    return formError(res, section, data, error);
  }
  const files = req.files || {};
  if (files.image) data.image = '/uploads/' + files.image[0].filename;
  if (section.hasFile && files.file) data.file = '/uploads/' + files.file[0].filename;

  await Entry.create({ section: section.key, ...data });
  req.flash('success', 'Item created.');
  res.redirect(`/admin/${section.key}`);
};

exports.editForm = async (req, res, next) => {
  const entry = await Entry.findOne({ _id: req.params.id, section: req.section.key }).lean();
  if (!entry) return next();
  res.render('admin/form', { title: req.section.label, section: req.section, entry });
};

exports.update = async (req, res, next) => {
  const section = req.section;
  const entry = await Entry.findOne({ _id: req.params.id, section: section.key });
  if (!entry) return next();

  const data = pickFields(section, req.body);
  const error = validate(data);
  if (error) {
    discardUploaded(req);
    return formError(res, section, { ...entry.toObject(), ...data }, error);
  }

  const files = req.files || {};
  const b = req.body;
  if (files.image) {
    removeUpload(entry.image);
    data.image = '/uploads/' + files.image[0].filename;
  } else if (b.removeImage === '1') {
    removeUpload(entry.image);
    data.image = '';
  }
  if (section.hasFile) {
    if (files.file) {
      removeUpload(entry.file);
      data.file = '/uploads/' + files.file[0].filename;
    } else if (b.removeFile === '1') {
      removeUpload(entry.file);
      data.file = '';
    }
  }

  entry.set(data);
  await entry.save();
  req.flash('success', 'Changes saved.');
  res.redirect(`/admin/${section.key}`);
};

exports.remove = async (req, res, next) => {
  const entry = await Entry.findOne({ _id: req.params.id, section: req.section.key });
  if (!entry) return next();
  removeUpload(entry.image);
  removeUpload(entry.file);
  await entry.deleteOne();
  req.flash('success', 'Item deleted.');
  res.redirect(`/admin/${req.section.key}`);
};
