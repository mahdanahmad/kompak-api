const express 		= require('express');
const controller 	= require('../controllers/essay');

const router  		= express.Router();

router.get('/', (req, res, next) => {
	controller.index(req.query, (result) => { res.status(result.status_code).json(result); });
});
router.get('/:id', (req, res, next) => {
	controller.show(req.params.id, (result) => { res.status(result.status_code).json(result); });
});
router.post('/', (req, res, next) => {
	controller.store(req.body, (result) => { res.status(result.status_code).json(result); });
});
router.put('/:id', (req, res, next) => {
	controller.update(req.params.id, req.body, (result) => { res.status(result.status_code).json(result); });
});
router.delete('/:id', (req, res, next) => {
	controller.destroy(req.params.id, req.body, (result) => { res.status(result.status_code).json(result); });
});

module.exports = router;
