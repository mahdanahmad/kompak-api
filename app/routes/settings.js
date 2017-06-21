const express 		= require('express');
const controller 	= require('../controllers/settings');

const router  		= express.Router();

router.get('/', (req, res, next) => {
	controller.index(req.query, (result) => { res.status(result.status_code).json(result); });
});
router.put('/', (req, res, next) => {
	controller.update(req.body, (result) => { res.status(result.status_code).json(result); });
});

module.exports = router;
