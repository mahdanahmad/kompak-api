const _				= require('lodash');
const moment		= require('moment');
const async			= require('async');
const json2csv 		= require('json2csv');

const user  		= require('../models/user');
const essay			= require('../models/essay');
const answer  		= require('../models/answer');
const question		= require('../models/question');
const essayAnswer	= require('../models/essayAnswer');

const province		= require('../models/province');
const regency		= require('../models/regency');
const district		= require('../models/district');
const village		= require('../models/village');

const globalMsg		= require('../helpers/messages');

const dateFormat	= 'YYYY-MM-DD HH:mm:ss';
const outFormat		= 'dddd, D MMMM YYYY HH:mm:ss';

require('moment/locale/id');
moment.locale('id');

module.exports.topScore	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export top score success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			let joinQuery	= [
				'tbl_usrs ON topscore.answered_by = tbl_usrs.ID',
				'tbl_provinces ON tbl_usrs.usr_province = tbl_provinces.id',
				'tbl_regencies ON tbl_usrs.usr_regency = tbl_regencies.id',
				'tbl_districts ON tbl_usrs.usr_district = tbl_districts.id',
				'tbl_villages ON tbl_usrs.usr_village = tbl_villages.id',
				'tbl_institution ON tbl_usrs.usr_institution = tbl_institution.id',
			];
			let selected	= ['tbl_usrs.usr_display_name', 'usr_designation', 'tbl_provinces.name_prov', 'tbl_regencies.name_kab', 'tbl_districts.name_kec', 'tbl_villages.name_desa', 'tbl_institution.name_institution', 'topscore.jumlah'];

			let leftJoin	= [joinQuery.join(' LEFT JOIN ')];
			let answerQuery	= '(SELECT answered_by, COUNT(*) as jumlah FROM ?? WHERE status_answer = 1 AND answered_date >= \'' + startDate + '\' AND answered_date < \'' + endDate + '\' GROUP BY answered_by) as topscore';
			let query		= 'SELECT ' + selected + ' FROM ' + answerQuery + ' LEFT JOIN ' + leftJoin + ' ORDER BY jumlah DESC';

			answer.raw(query, (err, result) => {
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
						'Jawaban': o.jumlah,
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.contributors	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export contributors success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			let joinQuery	= [
				'tbl_usrs ON contributors.usr_id = tbl_usrs.ID',
				'tbl_provinces ON tbl_usrs.usr_province = tbl_provinces.id',
				'tbl_regencies ON tbl_usrs.usr_regency = tbl_regencies.id',
				'tbl_districts ON tbl_usrs.usr_district = tbl_districts.id',
				'tbl_villages ON tbl_usrs.usr_village = tbl_villages.id',
				'tbl_institution ON tbl_usrs.usr_institution = tbl_institution.id',
			];
			let selected	= ['usr_display_name', 'usr_designation', 'tbl_provinces.name_prov', 'tbl_regencies.name_kab', 'tbl_districts.name_kec', 'tbl_villages.name_desa', 'tbl_institution.name_institution', 'jumlah'];

			let leftJoin	= [joinQuery.join(' LEFT JOIN ')];
			let qstnQuery	= '(SELECT usr_id, COUNT(*) as jumlah FROM ?? WHERE submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\' GROUP BY usr_id) as contributors';
			let query		= 'SELECT ' + selected + ' FROM ' + qstnQuery + ' LEFT JOIN ' + leftJoin + ' ORDER BY jumlah DESC';

			question.raw(query, (err, result) => {
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
						'Jumlah Kontribusi': o.jumlah,
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.topVillage	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export top village success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

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

			user.raw('SELECT ' + selected + ', topVillage.jumlah FROM (SELECT ' + prevSelect + ', COUNT(*) as jumlah FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY ' + prevSelect + ' ORDER BY jumlah DESC) as topVillage LEFT JOIN ' + leftJoin, (err, result) => {
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.notMyProvince	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export province which not yet joined success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.age	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export top age distribution success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			user.raw('SELECT usr_year_born, COUNT(*) as jumlah FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_year_born ORDER BY usr_year_born DESC', (err, result) => {
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.institution	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export institution distribution success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			user.raw('SELECT tbl_institution.name_institution, countInstitution.jumlah FROM (SELECT usr_institution, count(*) as jumlah FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_institution) as countInstitution RIGHT JOIN tbl_institution ON countInstitution.usr_institution = tbl_institution.id', (err, result) => {
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.education	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export education distribution success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			user.raw('SELECT tbl_education.education, countEducation.jumlah FROM (SELECT usr_education, count(*) as jumlah FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_education) as countEducation RIGHT JOIN tbl_education ON countEducation.usr_education = tbl_education.id', (err, result) => {
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.designation	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export designation distribution success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			user.raw('SELECT usr_designation, COUNT(*) as jumlah FROM ??  WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_designation ORDER BY jumlah DESC', (err, result) => {
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.userdata	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export user data success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			let joinQuery	= [
				'tbl_provinces ON tbl_usrs.usr_province = tbl_provinces.id',
				'tbl_regencies ON tbl_usrs.usr_regency = tbl_regencies.id',
				'tbl_districts ON tbl_usrs.usr_district = tbl_districts.id',
				'tbl_villages ON tbl_usrs.usr_village = tbl_villages.id',
				'tbl_institution ON tbl_usrs.usr_institution = tbl_institution.id',
				'tbl_education ON tbl_usrs.usr_education = tbl_education.id',
			];

			let query		= _.omitBy({
				leftJoin: [joinQuery.join(' LEFT JOIN ')],
				where: ['last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\'' + (!_.isNil(input.like) ? ' AND usr_display_name LIKE ?' : ''), (!_.isNil(input.like) ? ['%' + input.like + '%'] : [])],
				orderBy: !_.isNil(input.orderby) ? [input.orderby]	: null
			}, _.isNil);
			let selected	= ['usr_email', 'usr_display_name', 'usr_designation', 'usr_gender', 'tbl_provinces.name_prov', 'tbl_regencies.name_kab', 'tbl_districts.name_kec', 'tbl_villages.name_desa', 'usr_year_born', 'usr_contribution', 'usr_score', 'last_logged_in', 'no_of_times_logged_in', 'tbl_institution.name_institution', 'tbl_education.education'];

			user.findAll(selected, query, {}, (err, result) => {
				if (err) { return flowCallback(err); }

				let currentYear	= moment().format('YYYY');

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Nama': o.usr_display_name,
						'E-mail': o.usr_email,
						'Jabatan': o.usr_designation,
						'Jenis Kelamin': o.usr_gender,
						'Provinsi': o.name_prov,
						'Kabupaten': o.name_kab,
						'Kecamatan': o.name_kec,
						'Desa': o.name_desa,
						'Lembaga': o.name_institution,
						'Pendidikan': o.education,
						'Umur': currentYear > o.usr_year_born ? currentYear - o.usr_year_born : '-',
						'Jumlah Kontribusi': o.usr_contribution,
						'Skor': o.usr_score,
						'Jumlah Login': o.no_of_times_logged_in,
						'Login Terakhir': moment(new Date(o.last_logged_in)).format(outFormat)
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.choicesdata	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export multiple choices data distribution success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			let joinQuery	= [
				'tbl_questions_categories ON tbl_questions.question_category = tbl_questions_categories.ID_category',
				'tbl_usrs ON tbl_questions.usr_id = tbl_usrs.ID',
			];

			let like		= !_.isNil(input.like) ? ['tbl_usrs.usr_display_name LIKE ?', '%' + input.like + '%'] : null;
			let category	= !_.isNil(input.category) ? ['tbl_questions.question_category = ?', input.category] : null;
			let where		= _.compact([like, category])
			let whereQuery	= (where.length > 0) ? [_.chain(where).map((o) => (o[0])).join(' AND ').value(), _.flatMap(where, (o) => (o[1]))] : null;

			let query		= _.omitBy({
				leftJoin: [joinQuery.join(' LEFT JOIN ')],
				where: ['submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\'' + (!_.isNil(whereQuery) ? ' AND ' + whereQuery[0] : ''), (!_.isNil(whereQuery) ? whereQuery[1] : [])],
				orderBy: ['status, question_enabled'],
			}, _.isNil);
			let selected	= ['usr_display_name', 'category_name', 'question_text', 'response_1', 'response_2', 'response_3', 'response_4', 'correct_response', 'bonus_value', 'time_to_answer', 'question_enabled', 'no_of_times_correctly_answered', 'no_of_times_incorrectly_answered', 'no_of_times_presented_as_challenge', 'no_of_times_response_1', 'no_of_times_response_2', 'no_of_times_response_3', 'no_of_times_response_4', 'status', 'submitted_date', 'modified_date'];

			question.findAll(selected, query, {}, (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Nama Kontributor': o.usr_display_name || '-',
						'Kategori': o.category_name,
						'Pertanyaan': o.question_text,
						'Jawaban 1': o.response_1,
						'Jawaban 2': o.response_2,
						'Jawaban 3': o.response_3,
						'Jawaban 4': o.response_4,
						'Jawaban Benar': o.correct_response,
						'Nilai Bonus': o.bonus_value,
						'Waktu mejawab (detik)': o.time_to_answer,
						'Pertanyaan Aktif': o.question_enabled,
						'Jumlah dijawab benar': o.no_of_times_correctly_answered,
						'Jumlah dijawab salah': o.no_of_times_incorrectly_answered,
						'Jumlah ditampilkan': o.no_of_times_presented_as_challenge,
						'Jumlah dijawab jawaban 1': o.no_of_times_response_1,
						'Jumlah dijawab jawaban 2': o.no_of_times_response_2,
						'Jumlah dijawab jawaban 3': o.no_of_times_response_3,
						'Jumlah dijawab jawaban 4': o.no_of_times_response_4,
						'Status': o.status,
						'Tanggal dimasukkan': (o.submitted_date) ? moment(new Date(o.submitted_date)).format(outFormat) : '-',
						'Tanggal dirubah': (o.modified_date) ? moment(new Date(o.modified_date)).format(outFormat) : '-'
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.choicesansdata	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export multiple choices answer data distribution success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			let joinQuery	= [
				'tbl_questions ON tbl_user_answer.question_id = tbl_questions.ID_question',
				'tbl_usrs ON tbl_user_answer.answered_by = tbl_usrs.ID',
			];

			let like		= !_.isNil(input.like) ? ['question_text LIKE ?', '%' + input.like + '%'] : null;
			let category	= !_.isNil(input.category) ? ['question_category = ?', input.category] : null;
			let where		= _.compact([like, category])
			let whereQuery	= (where.length > 0) ? [_.chain(where).map((o) => (o[0])).join(' AND ').value(), _.flatMap(where, (o) => (o[1]))] : null;

			let query		= _.omitBy({
				leftJoin: [joinQuery.join(' LEFT JOIN ')],
				where: ['submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\'' + (!_.isNil(whereQuery) ? ' AND ' + whereQuery[0] : ''), (!_.isNil(whereQuery) ? whereQuery[1] : [])],
				orderBy: ['answered_date DESC'],
			}, _.isNil);
			let selected	= ['question_text', 'usr_display_name', 'status_answer', 'answered_date'];

			answer.findAll(selected, query, {}, (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Pertanyaan': o.question_text || '-',
						'Penjawab': o.usr_display_name,
						'Status': o.status_answer ? 'Benar' : 'Salah',
						'Tanggal jawaban': (o.answered_date) ? moment(new Date(o.answered_date)).format(outFormat) : '-',
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.essaydata	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export essay data distribution success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			let joinQuery	= [
				'tbl_questions_categories ON tbl_essai.ID_category = tbl_questions_categories.ID_category',
			];

			let like		= !_.isNil(input.like) ? ['question LIKE ?', '%' + input.like + '%'] : null;
			let category	= !_.isNil(input.category) ? ['tbl_essai.ID_category = ?', input.category] : null;
			let where		= _.compact([like, category])
			let whereQuery	= (where.length > 0) ? [_.chain(where).map((o) => (o[0])).join(' AND ').value(), _.flatMap(where, (o) => (o[1]))] : null;

			let query		= _.omitBy({
				leftJoin: [joinQuery.join(' LEFT JOIN ')],
				where: ['submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\'' + (!_.isNil(whereQuery) ? ' AND ' + whereQuery[0] : ''), (!_.isNil(whereQuery) ? whereQuery[1] : [])],
			}, _.isNil);
			let selected	= ['category_name', 'question', 'submitted_date'];

			essay.findAll(selected, query, {}, (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Pertanyaan': o.question,
						'Kategori': o.category_name,
						'Tanggal dimasukkan': (o.submitted_date) ? moment(new Date(o.submitted_date)).format(outFormat) : '-',
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.essayansdata	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export essay answer data distribution success.';
	let result          = null;

	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			let joinQuery	= [
				'tbl_essai ON tbl_essai_answers.id_essai_question = tbl_essai.id',
				'tbl_usrs ON tbl_essai_answers.usr_id = tbl_usrs.ID',
			];

			let like		= !_.isNil(input.like) ? ['tbl_usrs.usr_display_name LIKE ?', '%' + input.like + '%'] : null;
			let category	= !_.isNil(input.category) ? ['tbl_essai.ID_category = ?', input.category] : null;
			let where		= _.compact([like, category]);
			let whereQuery	= (where.length > 0) ? [_.chain(where).map((o) => (o[0])).join(' AND ').value(), _.flatMap(where, (o) => (o[1]))] : null;

			let query		= _.omitBy({
				leftJoin: [joinQuery.join(' LEFT JOIN ')],
				where: ['tbl_essai_answers.submitted_date >= \'' + startDate + '\' AND tbl_essai_answers.submitted_date < \'' + endDate + '\'' + (!_.isNil(whereQuery) ? ' AND ' + whereQuery[0] : ''), (!_.isNil(whereQuery) ? whereQuery[1] : [])],
				orderBy: ['tbl_essai_answers.submitted_date DESC'],
			}, _.isNil);
			let selected	= ['usr_display_name', 'question', 'answer', 'tbl_essai_answers.submitted_date'];

			essayAnswer.findAll(selected, query, {}, (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => ({
						'No': key + 1,
						'Nama Penjawab': o.usr_display_name,
						'Pertanyaan': o.question,
						'Jawaban': o.answer,
						'Tanggal dijawab': (o.submitted_date) ? moment(new Date(o.submitted_date)).format(outFormat) : '-',
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
		callback({ response, status_code, message, result, date: moment(startDate).format('YYYYMMDD') + '_' + moment(endDate).format('YYYYMMDD') });
	});
}

module.exports.locationdata	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Export location data distribution success.';
	let result          = null;

	let name			= 'all';
	let collection		= province;
	let tableId			= null;
	let id				= null;
	let tableName		= 'name_prov';
	let headerMap		= {
		name_prov	: 'Provinsi',
		name_kab	: 'Kabupaten',
		name_kec	: 'Kecamatan',
		name_desa	: 'Desa',
	}

	async.waterfall([
		(flowCallback) => {
			if (!_.isNil(input.province)) {
				province.find(input.province, (err, result) => {
					if (err) { return flowCallback(err); }
					if (_.isNil(result)) { return flowCallback('Province with id ' + input.province + ' not found.'); }

					name = 'provinsi_' + result.name_prov; collection = regency; tableId = 'province_id'; id = input.province; tableName = 'name_kab';
					flowCallback(null, { Provinsi: result.name_prov });
				})
			} else {
				flowCallback(null, {});
			}
		},
		(data, flowCallback) => {
			if (!_.isNil(input.province) && !_.isNil(input.regency)) {
				regency.find(input.regency, (err, result) => {
					if (err) { return flowCallback(err); }
					if (_.isNil(result)) { return flowCallback('Regency with id ' + input.regency + ' not found.'); }

					name = 'kabupaten_' + result.name_kab; collection = district; tableId = 'regency_id'; id = input.regency; tableName = 'name_kec';
					flowCallback(null, _.assign(data, { Kabupaten: result.name_kab }));
				})
			} else {
				flowCallback(null, data);
			}
		},
		(data, flowCallback) => {
			if (!_.isNil(input.province) && !_.isNil(input.regency) && !_.isNil(input.district)) {
				district.find(input.district, (err, result) => {
					if (err) { return flowCallback(err); }
					if (_.isNil(result)) { return flowCallback('District with id ' + input.district + ' not found.'); }

					name = 'kecamatan_' + result.name_kec; collection = village; tableId = 'district_id'; id = input.district; tableName = 'name_desa';
					flowCallback(null,_.assign(data, { Kecamatan: result.name_kec }));
				})
			} else {
				flowCallback(null, data);
			}
		},
		(data, flowCallback) => {
			let query	= _.omitBy({
				where: !_.isNil(tableId) ? [tableId + ' = ?', id] : null,
				orderBy: [tableName],
			}, _.isNil);

			collection.findAll([tableName], query, {}, (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, json2csv({
					data: _.map(result, (o, key) => {
						let each	= _.assign({ No : key + 1 }, data);
						each[headerMap[tableName]]	= o[tableName];
						return each;
					})
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
		callback({ response, status_code, message, result, name });
	});
}
