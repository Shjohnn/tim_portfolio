const multer = require('multer');
const crypto = require('crypto');
const { UPLOAD_DIR } = require('../utils/files');

const EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'application/pdf': '.pdf',
};

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  // Kengaytma foydalanuvchi bergan nomdan emas, fayl turidan olinadi.
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${EXT[file.mimetype]}`),
});

function fileFilter(req, file, cb) {
  const isPdfField = file.fieldname === 'file';
  const ok = isPdfField ? file.mimetype === 'application/pdf' : file.mimetype.startsWith('image/') && EXT[file.mimetype];
  if (ok) return cb(null, true);
  cb(new Error(isPdfField ? 'Only PDF files are allowed.' : 'Only JPG, PNG, WebP, GIF or AVIF images are allowed.'));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024, files: 2 } });

// Yuklash xatosi bo'lsa, formaga flash xabar bilan qaytaradi.
const safe = (mw) => (req, res, next) =>
  mw(req, res, (err) => {
    if (!err) return next();
    req.flash('error', err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 10 MB).' : err.message);
    res.redirect(req.get('Referer') || '/admin');
  });

module.exports = {
  entryFiles: safe(upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }])),
  portraitFile: safe(upload.single('portrait')),
};
