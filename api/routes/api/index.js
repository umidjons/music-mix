const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/medias', require('./medias'));

module.exports = router;
