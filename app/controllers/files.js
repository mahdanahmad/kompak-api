const _				= require('lodash');
const moment		= require('moment');
const async			= require('async');
const json2csv 		= require('json2csv');

const user  		= require('../models/user');
const province		= require('../models/province');

const globalMsg		= require('../helpers/messages');

module.exports.topScore	= (callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export top score success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			let joinQuery	= [
				'tbl_provinces ON tbl_usrs.usr_province = tbl_provinces.id',
				'tbl_regencies ON tbl_usrs.usr_regency = tbl_regencies.id',
				'tbl_districts ON tbl_usrs.usr_district = tbl_districts.id',
				'tbl_villages ON tbl_usrs.usr_village = tbl_villages.id',
				'tbl_institution ON tbl_usrs.usr_institution = tbl_institution.id',
			]

			let query	= {
				leftJoin: [joinQuery.join(' LEFT JOIN ')],
				orderBy: ['usr_score DESC'],
			}

			let selected	= ['usr_display_name', 'usr_designation', 'tbl_provinces.name_prov', 'tbl_regencies.name_kab', 'tbl_districts.name_kec', 'tbl_villages.name_desa', 'tbl_institution.name_institution', 'usr_score'];

			user.findAll(selected, query, {}, (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Nama': o.usr_display_name,
						'Jabatan': o.usr_designation,
						'Provinsi': o.name_prov,
						'Kabupaten': o.name_kab,
						'Kecamatan': o.name_kec,
						'Desa': o.name_desa,
						'Lembaga': o.name_institution,
						'Skor': o.usr_score,
					})),
				}));
			});
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
}

module.exports.contributors	= (callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export contributors success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			let joinQuery	= [
				'tbl_provinces ON tbl_usrs.usr_province = tbl_provinces.id',
				'tbl_regencies ON tbl_usrs.usr_regency = tbl_regencies.id',
				'tbl_districts ON tbl_usrs.usr_district = tbl_districts.id',
				'tbl_villages ON tbl_usrs.usr_village = tbl_villages.id',
				'tbl_institution ON tbl_usrs.usr_institution = tbl_institution.id',
			]

			let query	= {
				leftJoin: [joinQuery.join(' LEFT JOIN ')],
				orderBy: ['usr_contribution DESC'],
			}

			let selected	= ['usr_display_name', 'usr_designation', 'tbl_provinces.name_prov', 'tbl_regencies.name_kab', 'tbl_districts.name_kec', 'tbl_villages.name_desa', 'tbl_institution.name_institution', 'usr_contribution'];

			user.findAll(selected, query, {}, (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Nama': o.usr_display_name,
						'Jabatan': o.usr_designation,
						'Provinsi': o.name_prov,
						'Kabupaten': o.name_kab,
						'Kecamatan': o.name_kec,
						'Desa': o.name_desa,
						'Lembaga': o.name_institution,
						'Jumlah Kontribusi': o.usr_contribution,
					})),
				}));
			});
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
}

module.exports.topVillage	= (callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export top village success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			let joinQuery	= [
				'tbl_provinces ON usr_province = tbl_provinces.id',
				'tbl_regencies ON usr_regency = tbl_regencies.id',
				'tbl_districts ON usr_district = tbl_districts.id',
				'tbl_villages ON usr_village = tbl_villages.id',
			];
			let leftJoin 	= joinQuery.join(' LEFT JOIN ');
			let prevSelect	= 'usr_province, usr_regency, usr_district, usr_village'
			let selected 	= 'tbl_provinces.name_prov, tbl_regencies.name_kab, tbl_districts.name_kec, tbl_villages.name_desa';

			user.raw('SELECT ' + selected + ', topVillage.jumlah FROM (SELECT ' + prevSelect + ', COUNT(*) as jumlah FROM ?? GROUP BY ' + prevSelect + ' ORDER BY jumlah DESC) as topVillage LEFT JOIN ' + leftJoin, (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Provinsi': o.name_prov,
						'Kabupaten': o.name_kab,
						'Kecamatan': o.name_kec,
						'Desa': o.name_desa,
						'Jumlah Peserta': o.jumlah,
					})),
				}));
			});
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
}

module.exports.notMyProvince	= (callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export province which not yet joined success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			province.raw('SELECT name_prov FROM ?? WHERE id NOT IN (SELECT usr_province FROM tbl_usrs)', (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Provinsi': o.name_prov,
					})),
				}));
			});
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
}

module.exports.age	= (callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export top age distribution success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			user.raw('SELECT usr_year_born, COUNT(*) as jumlah FROM ?? GROUP BY usr_year_born ORDER BY usr_year_born DESC', (err, result) => {
				if (err) { return flowCallback(err); }

				let currentYear	= moment().format('YYYY');

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Umur': currentYear > o.usr_year_born ? currentYear - o.usr_year_born : '-',
						'Jumlah': o.jumlah
					})),
				}));
			});
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
}

module.exports.institution	= (callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export institution distribution success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			user.raw('SELECT tbl_institution.name_institution, countInstitution.jumlah FROM (SELECT usr_institution, count(*) as jumlah FROM ?? GROUP BY usr_institution) as countInstitution RIGHT JOIN tbl_institution ON countInstitution.usr_institution = tbl_institution.id', (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Lembaga': o.name_institution,
						'Jumlah': o.jumlah || 0
					})),
				}));
			});
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
}

module.exports.education	= (callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export education distribution success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			user.raw('SELECT tbl_education.education, countEducation.jumlah FROM (SELECT usr_education, count(*) as jumlah FROM ?? GROUP BY usr_education) as countEducation RIGHT JOIN tbl_education ON countEducation.usr_education = tbl_education.id', (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Pendidikan': o.education,
						'Jumlah': o.jumlah || 0
					})),
				}));
			});
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
}

module.exports.designation	= (callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export designation distribution success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			user.raw('SELECT usr_designation, COUNT(*) as jumlah FROM ?? GROUP BY usr_designation ORDER BY jumlah DESC', (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Jabatan': o.usr_designation,
						'Jumlah': o.jumlah
					})),
				}));
			});
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
}
