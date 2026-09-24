const Entry = require('../models/Entry');
const sections = require('../config/sections');

// Bosh sahifa: nashr qilingan yozuvlar bo'limlar bo'yicha guruhlanadi.
exports.home = async (req, res) => {
  const entries = await Entry.find({ published: true }).sort({ order: 1, date: -1, createdAt: -1 }).lean();
  const data = {};
  sections.forEach((s) => (data[s.key] = []));
  entries.forEach((e) => data[e.section] && data[e.section].push(e));
  res.render('index', { data });
};

// Detail sahifa: /:section/:slug (admin kirgan bo'lsa, draftni ham ko'radi).
exports.entry = async (req, res, next) => {
  const section = sections.find((s) => s.key === req.params.section);
  if (!section) return next();
  const query = { section: section.key, slug: req.params.slug };
  if (!req.session.admin) query.published = true;
  const entry = await Entry.findOne(query).lean();
  if (!entry) return next();
  res.render('entry', { entry, section });
};
