// Saytdagi 5 ta bo'lim. Admin panel, bosh sahifa va detail sahifa shu ro'yxatdan foydalanadi.
module.exports = [
  {
    key: 'academic',
    heading: 'Academic journey',
    label: 'Academic',
    intro: 'Education, academic performance, coursework, projects and milestones.',
    tags: ['Education', 'Academic', 'Languages'],
  },
  {
    key: 'research',
    heading: 'Research & thesis',
    label: 'Research',
    intro: 'Thesis work, papers, research questions, methodology, findings and downloadable documents.',
    tags: ['Thesis', 'Research', 'Publications'],
    hasFile: true, // PDF yuklash
  },
  {
    key: 'analysis',
    heading: 'Analysis & writing',
    label: 'Analysis',
    intro: 'A searchable archive of daily analysis, essays and ideas across business, economics, technology and global issues.',
    tags: ['Daily analysis', 'Essay', 'Ideas'],
    hasDate: true,
  },
  {
    key: 'achievements',
    heading: 'Achievements',
    label: 'Achievements',
    intro: 'Awards, leadership, volunteering, competitions, certifications and other milestones.',
    tags: [],
    hasYear: true, // timeline uchun: "2026", "2025", "Earlier"
  },
  {
    key: 'projects',
    heading: 'Projects',
    label: 'Projects',
    intro: 'Things I have built, organized or led — with outcomes, photos and supporting files.',
    tags: ['Leadership', 'Community', 'Future'],
    hasLink: true,
  },
];
