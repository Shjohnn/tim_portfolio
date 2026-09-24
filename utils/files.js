const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

// "/uploads/abc.jpg" ko'rinishidagi yo'ldan faylni diskdan o'chiradi (boshqa joyga tegmaydi).
function removeUpload(urlPath) {
  if (!urlPath || !urlPath.startsWith('/uploads/')) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(urlPath)), () => {});
}

// Forma xato bilan qaytsa, hozirgina yuklangan fayllarni tozalaydi.
function discardUploaded(req) {
  const list = [];
  if (req.file) list.push(req.file);
  if (req.files) Object.values(req.files).forEach((arr) => list.push(...arr));
  list.forEach((f) => removeUpload('/uploads/' + f.filename));
}

module.exports = { UPLOAD_DIR, removeUpload, discardUploaded };
