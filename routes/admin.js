const router = require('express').Router();
const wrap = require('../utils/asyncHandler');
const sections = require('../config/sections');
const ctrl = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const limiter = require('../middleware/loginLimiter');
const { entryFiles, portraitFile } = require('../middleware/upload');

// Login (himoyasiz)
router.get('/login', ctrl.loginForm);
router.post('/login', limiter.check, wrap(ctrl.login));
router.post('/logout', ctrl.logout);

// Bundan keyingi hamma narsa faqat admin uchun
router.use(requireAdmin);

router.get('/', wrap(ctrl.dashboard));
router.get('/profile', ctrl.profileForm);
router.post('/profile', portraitFile, wrap(ctrl.profileUpdate));

// :section noto'g'ri bo'lsa 404
router.param('section', (req, res, next, key) => {
  req.section = sections.find((s) => s.key === key);
  if (!req.section) {
    const err = new Error('Not found');
    err.status = 404;
    return next(err);
  }
  next();
});

router.get('/:section', wrap(ctrl.list));
router.get('/:section/new', ctrl.newForm);
router.post('/:section', entryFiles, wrap(ctrl.create));
router.get('/:section/:id/edit', wrap(ctrl.editForm));
router.post('/:section/:id/edit', entryFiles, wrap(ctrl.update));
router.post('/:section/:id/delete', wrap(ctrl.remove));

module.exports = router;
