const { Schema, model } = require('mongoose');
const SECTIONS = require('../config/sections').map((s) => s.key);

// Academic, Research, Analysis, Achievements, Projects — hammasi shu bitta model.
// "section" maydoni qaysi bo'limga tegishli ekanini bildiradi.
const entrySchema = new Schema(
  {
    section: { type: String, enum: SECTIONS, required: true, index: true },
    tag: { type: String, trim: true }, // Education, Thesis, Essay...
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    summary: { type: String, trim: true }, // kartadagi qisqa matn
    content: { type: String }, // detail sahifadagi to'liq matn (Markdown)
    year: { type: String, trim: true }, // faqat Achievements: "2026", "Earlier"
    date: { type: Date }, // faqat Analysis
    image: { type: String, default: '' }, // ixtiyoriy: /uploads/xxx.jpg
    videoUrl: { type: String, default: '' }, // ixtiyoriy: YouTube havolasi
    file: { type: String, default: '' }, // faqat Research: PDF yo'li
    link: { type: String, default: '' }, // faqat Projects: tashqi havola
    order: { type: Number, default: 0 }, // kichigi yuqorida
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

entrySchema.index({ section: 1, slug: 1 }, { unique: true });

// Slug sarlavhadan avtomatik yaratiladi va tahrirda o'zgarmaydi (havola buzilmasligi uchun).
entrySchema.pre('validate', async function () {
  if (this.slug || !this.title) return;
  const base =
    this.title
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';
  let slug = base;
  let i = 1;
  while (await this.constructor.exists({ section: this.section, slug, _id: { $ne: this._id } })) {
    slug = `${base}-${++i}`;
  }
  this.slug = slug;
});

module.exports = model('Entry', entrySchema);
