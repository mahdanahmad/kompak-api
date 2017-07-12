const express		= require('express');
const controller 	= require('../controllers/files');

const moment		= require('moment');
const constructName	= (type) => ('gapuradesa-' + type + '-' + moment().format('YYYYMMDD_HHmm') + '.csv')

const router		= express.Router();


router.get('/topscore', (req, res, next) => {
	controller.topScore((result) => {
		res.attachment(constructName('topskor'));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/contributors', (req, res, next) => {
	controller.contributors((result) => {
		res.attachment(constructName('jml_kontribusi'));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/topvillage', (req, res, next) => {
	controller.topVillage((result) => {
		res.attachment(constructName('partisipasi_desa'));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/notmyprovince', (req, res, next) => {
	controller.notMyProvince((result) => {
		res.attachment(constructName('provinsi_belum_bergabung'));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/age', (req, res, next) => {
	controller.age((result) => {
		res.attachment(constructName('distribusi_umur'));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/institution', (req, res, next) => {
	controller.institution((result) => {
		res.attachment(constructName('distribusi_lembaga'));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/education', (req, res, next) => {
	controller.education((result) => {
		res.attachment(constructName('distribusi_pendidikan'));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/designation', (req, res, next) => {
	controller.designation((result) => {
		res.attachment(constructName('distribusi_jabatan'));
		res.status(result.status_code).send(result.result);
	});
});

module.exports = router;
