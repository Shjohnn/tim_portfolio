const { Schema, model } = require('mongoose');

// Saytda bitta yozuv bo'ladi (singleton): hero, about, footer matnlari.
const profileSchema = new Schema(
  {
    fullName: { type: String, default: 'Ozodbek Juraev' },
    logoText: { type: String, default: 'OZODBEK' },
    metaDescription: {
      type: String,
      default: 'Academic portfolio, research, analysis, achievements and projects.',
    },
    heroEyebrow: { type: String, default: 'Personal intellectual portfolio' },
    heroTitle: { type: String, default: 'Learn.\nGrow.\nCreate.\nLead.' }, // har qator alohida satr
    heroAccentLine: { type: Number, default: 3 }, // qaysi qator kulrang bo'lsin (1 dan boshlab, 0 = hech biri)
    heroText: {
      type: String,
      default:
        'A living record of academic work, research, ideas, analysis, leadership and the projects I build along the way.',
    },
    portrait: { type: String, default: '' }, // rasm yo'li: /uploads/xxx.jpg
    aboutText: {
      type: String,
      default:
        'I am building this space as an evolving public record of who I am, what I learn, what I research and how my thinking develops.',
    },
    quote: {
      type: String,
      default: "Don't just collect achievements. Build evidence of how you think, create and lead.",
    },
    footerText: {
      type: String,
      default: 'Personal portfolio · Built as a living record of growth.',
    },
  },
  { timestamps: true }
);

// Profil hali yo'q bo'lsa, standart qiymatlar bilan yaratib beradi.
profileSchema.statics.getOne = async function () {
  return (await this.findOne()) || (await this.create({}));
};

module.exports = model('Profile', profileSchema);
