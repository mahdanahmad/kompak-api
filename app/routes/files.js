const express		= require('express');
const controller 	= require('../controllers/files');

const moment		= require('moment');
const constructName	= (type, date) => ('gapuradesa-' + type + '-' + date + '.csv')

const router		= express.Router();


router.get('/topscore', (req, res, next) => {
	controller.topScore(req.query, (result) => {
		res.attachment(constructName('topskor', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/contributors', (req, res, next) => {
	controller.contributors(req.query, (result) => {
		res.attachment(constructName('jml_kontribusi', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/topvillage', (req, res, next) => {
	controller.topVillage(req.query, (result) => {
		res.attachment(constructName('partisipasi_desa', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/notmyprovince', (req, res, next) => {
	controller.notMyProvince(req.query, (result) => {
		res.attachment(constructName('provinsi_belum_bergabung', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/age', (req, res, next) => {
	controller.age(req.query, (result) => {
		res.attachment(constructName('distribusi_umur', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/institution', (req, res, next) => {
	controller.institution(req.query, (result) => {
		res.attachment(constructName('distribusi_lembaga', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/education', (req, res, next) => {
	controller.education(req.query, (result) => {
		res.attachment(constructName('distribusi_pendidikan', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/designation', (req, res, next) => {
	controller.designation(req.query, (result) => {
		res.attachment(constructName('distribusi_jabatan', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/userdata', (req, res, next) => {
	controller.userdata(req.query, (result) => {
		res.attachment(constructName('daftar_pemain', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/choicesdata', (req, res, next) => {
	controller.choicesdata(req.query, (result) => {
		res.attachment(constructName('daftar_pilihan_ganda', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/choicesansdata', (req, res, next) => {
	controller.choicesansdata(req.query, (result) => {
		res.attachment(constructName('daftar_jawaban_pilihan_ganda', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/essaydata', (req, res, next) => {
	controller.essaydata(req.query, (result) => {
		res.attachment(constructName('daftar_essai', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/essayansdata', (req, res, next) => {
	controller.essayansdata(req.query, (result) => {
		res.attachment(constructName('daftar_jawaban_essai', result.date));
		res.status(result.status_code).send(result.result);
	});
});

router.get('/locationdata', (req, res, next) => {
	controller.locationdata(req.query, (result) => {
		res.attachment(constructName('daftar_lokasi', result.name));
		res.status(result.status_code).send(result.result);
	});
});

module.exports = router;
