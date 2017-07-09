const express 		= require('express');
const controller 	= require('../controllers/location');

const router  		= express.Router();

router.get('/:province?/:regency?/:district?/:village?', (req, res, next) => {
	controller.index([req.params.province, req.params.regency, req.params.district, req.params.village], req.query, (result) => { res.status(result.status_code).json(result); });
});
router.post('/:province?/:regency?/:district?/:village?', (req, res, next) => {
	controller.store([req.params.province, req.params.regency, req.params.district, req.params.village], req.body, (result) => { res.status(result.status_code).json(result); });
});
router.put('/:province?/:regency?/:district?/:village?', (req, res, next) => {
	controller.update([req.params.province, req.params.regency, req.params.district, req.params.village], req.body, (result) => { res.status(result.status_code).json(result); });
});
router.delete('/:province?/:regency?/:district?/:village?', (req, res, next) => {
	controller.destroy([req.params.province, req.params.regency, req.params.district, req.params.village], req.body, (result) => { res.status(result.status_code).json(result); });
});

module.exports = router;
