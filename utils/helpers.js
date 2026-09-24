const { marked } = require('marked');

// YouTube havolasidan 11 belgili video ID sini oladi (watch, youtu.be, shorts, embed, live).
function youtubeId(url = '') {
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/
  );
  return m ? m[1] : null;
}

// Markdown -> HTML (faqat admin yozadi, shuning uchun ishonchli manba).
function md(text = '') {
  return marked.parse(String(text));
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

module.exports = { youtubeId, md, fmtDate };
