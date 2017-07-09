const express		= require('express');
const controller 	= require('../controllers/index');

const router		= express.Router();

/* index. */
router.get('/', (req, res, next) => { res.json(); });

router.get('/statistic', (req, res, next) => {
	controller.statistic((result) => { res.status(result.status_code).json(result); });
});

router.post('/auth', (req, res, next) => {
	controller.auth(req.body, (result) => { res.status(result.status_code).json(result); });
});

router.get('/logs', (req, res, next) => {
	controller.logs(req.query, (result) => { res.status(result.status_code).json(result); });
});

module.exports = router;
