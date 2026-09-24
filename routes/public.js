const router = require('express').Router();
const wrap = require('../utils/asyncHandler');
const ctrl = require('../controllers/publicController');

router.get('/', wrap(ctrl.home));
router.get('/:section/:slug', wrap(ctrl.entry));

module.exports = router;
