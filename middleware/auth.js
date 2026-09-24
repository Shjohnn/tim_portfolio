exports.requireAdmin = (req, res, next) => {
  if (req.session.admin) return next();
  if (req.method === 'GET') req.session.returnTo = req.originalUrl;
  res.redirect('/admin/login');
};
