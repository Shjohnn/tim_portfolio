// Oddiy himoya: bir IP dan 5 marta xato kiritilsa, 15 daqiqa bloklanadi (xotirada saqlanadi).
const attempts = new Map();
const MAX = 5;
const WINDOW = 15 * 60 * 1000;

exports.check = (req, res, next) => {
  const r = attempts.get(req.ip);
  if (r && Date.now() >= r.until) attempts.delete(req.ip);
  else if (r && r.count >= MAX) {
    return res.status(429).render('admin/login', { title: 'Log in', error: 'Too many attempts. Try again in 15 minutes.' });
  }
  next();
};
exports.fail = (ip) => {
  const r = attempts.get(ip) || { count: 0 };
  r.count += 1;
  r.until = Date.now() + WINDOW;
  attempts.set(ip, r);
};
exports.reset = (ip) => attempts.delete(ip);
