const express		= require('express');
const controller 	= require('../controllers/index');

const router		= express.Router();

/* index. */
router.get('/', (req, res, next) => { res.json(); });

router.get('/statistic', (req, res, next) => {
	controller.statistic((result) => { res.status(result.status_code).json(result); });
});

module.exports = router;
