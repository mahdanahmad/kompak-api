const _				= require('lodash');
const moment		= require('moment');
const async			= require('async');
const hash 			= require('crypto-js/sha256');

const logs  		= require('../models/logs');
const user  		= require('../models/user');
const admin  		= require('../models/admin');
const essay  		= require('../models/essay');
const answer  		= require('../models/answer');
const province		= require('../models/province');
const question		= require('../models/question');
const essayAnswer	= require('../models/essayAnswer');

const globalMsg		= require('../helpers/messages');

module.exports.statistic = (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Get statistic success.';
	let result          = null;

	let topLimit		= 10;

	const dateFormat	= 'YYYY-MM-DD HH:mm:ss';
	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			let location	= ['province', 'regency', 'district', 'village'];
			let gender		= ['m', 'f'];
			let ageStep		= [15, 45, 5];
			let age			= _.chain((ageStep[1] - ageStep[0]) / ageStep[2]).times((o) => { let minAge = o * ageStep[2] + ageStep[0]; return [minAge, minAge + ageStep[2]]; }).unshift(ageStep[0]).push(ageStep[1]).value();
			let years		= _.map(age, (o) => (_.isArray(o) ? _.map(o, (d) => (moment().subtract(d, 'years').format("YYYY"))): moment().subtract(o, 'years').format("YYYY")));

			let countlogin	= 'COUNT(*) as login';
			let countLoc	= _.chain(location).map((o) => ('COUNT(DISTINCT usr_' + o + ') as ' + o + '')).join(', ').value();
			let countGender	= _.chain(gender).map((o) => ('SUM(if(usr_gender = \'' + o + '\', 1, 0)) as ' + o)).join(', ').value();
			let countAge	= _.chain(years).map((o, key) => ('SUM(if(' + (_.isArray(o) ? ('usr_year_born <= ' + o[0] + ' AND usr_year_born > ' + o[1]) : (age[key] == ageStep[0] ? 'usr_year_born > ' + o : 'usr_year_born <=' + o)) + ', 1, 0)) as \'' + (_.isArray(age[key]) ? age[key].join(' - ') : (age[key] == ageStep[0] ? '< ' + age[key] : age[key] + ' >=' )) + '\'')).join().value();

			let selected	= [countlogin, countLoc, countGender, countAge].join(', ');

			user.raw('SELECT ' + selected + ' FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\'', (err, result) => flowCallback(err, {
				gender: _.pick(result[0], gender),
				status: _.pick(result[0], _.concat(location, 'login')),
				age: [{ key: 'Age Distribution', values: _.chain(result[0]).pick(_.map(age, (o) => (_.isArray(o) ? o.join(' - ') : (o == ageStep[0] ? '< ' + o : o + ' >=' )))).map((jumlah, label) => ({ label, jumlah })).value() }]
			}));
		},
		(data, flowCallback) => {
			user.count((err, result) => {
				if (err) { return flowCallback(err); }
				_.assign(data.status, { total: result });
				flowCallback(null, data);
			});
		},
		(data, flowCallback) => {
			async.parallel({
				// essay: (callback) => { essay.raw('SELECT SUM(if(submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\',1,0)) as count from ??', (err, result) => callback(err, result[0].count)); },
				answer: (callback) => { answer.raw('SELECT SUM(if(answered_date >= \'' + startDate + '\' AND answered_date < \'' + endDate + '\',1,0)) as count from ??', (err, result) => callback(err, result[0].count)); },
				question: (callback) => { question.raw('SELECT SUM(if(submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\',1,0)) as count from ??', (err, result) => callback(err, result[0].count)); },
				essayAnswer: (callback) => { essayAnswer.raw('SELECT SUM(if(submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\',1,0)) as count from ??', (err, result) => callback(err, result[0].count)); },
			}, (err, results) => {
				if (err) { return flowCallback(err); }
				_.assign(data.status, { pertanyaan: results.question, jawaban: (results.answer + results.essayAnswer) });
				flowCallback(null, data);
			});
		},
		(data, flowCallback) => {
			async.parallel({
				topscore: (callback) => { answer.raw('SELECT topscore.jumlah, tbl_usrs.usr_display_name FROM (SELECT answered_by, COUNT(*) as jumlah FROM ?? WHERE status_answer = 1 AND answered_date >= \'' + startDate + '\' AND answered_date < \'' + endDate + '\' GROUP BY answered_by LIMIT 0, ' + topLimit + ') as topscore LEFT JOIN tbl_usrs ON topscore.answered_by = tbl_usrs.ID ORDER BY jumlah DESC', (err, result) => callback(err, result)); },
				topcontribution: (callback) => { question.raw('SELECT contributors.jumlah, tbl_usrs.usr_display_name FROM (SELECT usr_id, COUNT(*) as jumlah FROM ?? WHERE submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\' GROUP BY usr_id LIMIT 0, ' + topLimit + ') as contributors LEFT JOIN tbl_usrs ON contributors.usr_id = tbl_usrs.ID ORDER BY jumlah DESC', (err, result) => callback(err, result)); },
				topvillage: (callback) => { user.raw('SELECT tbl_villages.name_desa, topVillage.jumlah FROM (SELECT usr_village, COUNT(*) as jumlah FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_village ORDER BY jumlah DESC LIMIT 0, ' + topLimit + ') as topVillage LEFT JOIN tbl_villages ON topVillage.usr_village = tbl_villages.id', (err, result) => callback(err, result)); },
				notMyProvince: (callback) => { province.raw('SELECT name_prov FROM ?? WHERE id NOT IN (SELECT usr_province FROM tbl_usrs)', (err, result) => callback(err, _.map(result, 'name_prov'))); },
			}, (err, results) => flowCallback(err, _.assign(data, results)));
		},
		(data, flowCallback) => {
			async.parallel({
				institution: (callback) => { user.raw('SELECT tbl_institution.name_institution, countInstitution.jumlah FROM (SELECT usr_institution, count(*) as jumlah FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_institution) as countInstitution RIGHT JOIN tbl_institution ON countInstitution.usr_institution = tbl_institution.id', (err, result) => callback(err, _.map(result, (o) => ({ name: o.name_institution, jumlah: (o.jumlah || 0) })))); },
				education: (callback) => { user.raw('SELECT tbl_education.education, countEducation.jumlah FROM (SELECT usr_education, count(*) as jumlah FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_education) as countEducation RIGHT JOIN tbl_education ON countEducation.usr_education = tbl_education.id', (err, result) => callback(err, _.map(result, (o) => ({ name: o.education, jumlah: (o.jumlah || 0) })))); },
				designation: (callback) => { user.raw('SELECT usr_designation, COUNT(*) as jumlah FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_designation ORDER BY jumlah DESC LIMIT 0,8', (err, result) => callback(err, _.map(result, (o) => ({ name: o.usr_designation, jumlah: (o.jumlah || 0) })))); },
			}, (err, results) => flowCallback(err, _.assign(data, results)));
		},
		(data, flowCallback) => {
			async.parallel({
				easiestquestion: (callback) => { question.raw('SELECT question_text FROM ?? WHERE (no_of_times_correctly_answered - no_of_times_incorrectly_answered) = (SELECT max(no_of_times_correctly_answered - no_of_times_incorrectly_answered) FROM tbl_questions WHERE submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\') ORDER BY no_of_times_correctly_answered DESC LIMIT 1', (err, result) => callback(err, _.get(result, [0, 'question_text'], ''))); },
				hardestquestion: (callback) => { question.raw('SELECT question_text FROM ?? WHERE (no_of_times_correctly_answered - no_of_times_incorrectly_answered) = (SELECT min(no_of_times_correctly_answered - no_of_times_incorrectly_answered) FROM tbl_questions WHERE submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\') ORDER BY no_of_times_correctly_answered ASC LIMIT 1', (err, result) => callback(err, _.get(result, [0, 'question_text']))); },
				easiestcategory: (callback) => { question.raw('SELECT tbl_questions_categories.category_name FROM (SELECT question_category, SUM(no_of_times_correctly_answered - no_of_times_incorrectly_answered) as ansAvg FROM ?? WHERE submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\' GROUP BY question_category ORDER BY ansAvg LIMIT 1) as lowQuest LEFT JOIN tbl_questions_categories ON lowQuest.question_category = tbl_questions_categories.ID_category', (err, result) => callback(err, _.get(result, [0, 'category_name'], ''))); },
				hardestcategory: (callback) => { question.raw('SELECT tbl_questions_categories.category_name FROM (SELECT question_category, SUM(no_of_times_correctly_answered - no_of_times_incorrectly_answered) as ansAvg FROM ?? WHERE submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\' GROUP BY question_category ORDER BY ansAvg DESC LIMIT 1) as lowQuest LEFT JOIN tbl_questions_categories ON lowQuest.question_category = tbl_questions_categories.ID_category', (err, result) => callback(err, _.get(result, [0, 'category_name'], ''))); },
			}, (err, results) => flowCallback(err, _.assign(data, results)));
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
};

module.exports.auth	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'User login success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			const missing   = _.difference(['username', 'password'], _.chain(input).pickBy((o) => (!_.isEmpty(o))).keys().value());
			if (_.isEmpty(missing)) {
				flowCallback(null);
			} else {
				flowCallback('Missing required field(s) : {' + missing.join(', ') + '}.');
			}
		},
		(flowCallback) => {
			admin.findOne({ where: ['username = ? AND password = ?', [input.username, hash(input.password).toString()]] }, (err, result) => {
				if (err) { return flowCallback(err); }
				if (_.isNil(result)) { return flowCallback('username dan password yang anda masukkan tidak cocok.'); }

				let returned = _.pick(result, ['id', 'role']);
				returned.role = JSON.parse(returned.role);

				flowCallback(null, returned);
			});
		},
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

module.exports.logs	= (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Get logs success.';
	let result          = null;

	const limit			= !_.isNil(input.limit)		? _.toInteger(input.limit)	: 0;
	const offset		= !_.isNil(input.offset)	? _.toInteger(input.offset)	: 0;

	async.waterfall([
		(flowCallback) => {
			let like		= !_.isNil(input.like) ? ['name LIKE ?', '%' + input.like + '%'] : null;
			let state		= !_.isNil(input.state) ? ['state = ?', input.state] : null;
			let where		= _.compact([like, state])

			let query		= _.omitBy({
				leftJoin: ['tbl_admins ON tbl_logs.defendant = tbl_admins.id'],
				where: (where.length > 0) ? [_.chain(where).map((o) => (o[0])).join(' AND ').value(), _.flatMap(where, (o) => (o[1]))] : null,
				orderBy: ['recording_date DESC']
			}, _.isNil);
			let selected	= ['tbl_admins.name', 'state', 'affected_table', 'recording_date'];

			logs.findAll(selected, query, {limit, offset}, (err, result) => flowCallback(err, result));
		},
		(rawData, flowCallback) => {
			async.map(rawData, (o, next) => {
				let text	= "";
				switch (o.state) {
					case 'DELETE': text = "menghapus sebuah data pada table <strong>" + o.affected_table + "</strong>"; break;
					case 'UPDATE': text = "megubah sebuah data pada table <strong>" + o.affected_table + "</strong>"; break;
					case 'INSERT': text = "menambahkan sebuah data pada table <strong>" + o.affected_table + "</strong>"; break;
					default: text	= "unknown logs."
				}

				next(null, { defendant: o.name, state: o.state, recording_date: o.recording_date, text });
			}, (err, result) => flowCallback(err, result));
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
};


module.exports.list = (input, callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Get list success.';
	let result          = null;

	let topLimit		= 10;

	const dateFormat	= 'YYYY-MM-DD HH:mm:ss';
	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			switch (input.state) {
				case 'total':
					user.findAll(['usr_display_name'], { orderBy: ['usr_display_name'] }, {}, (err, result) => (flowCallback(err, _.map(result, 'usr_display_name'))));
					break;
				case 'login':
					user.findAll(['usr_display_name'], { where: ['last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\''], orderBy: ['usr_display_name'] }, {}, (err, result) => (flowCallback(err, _.map(result, 'usr_display_name'))));
					break;
				case 'male':
					user.findAll(['usr_display_name'], { where: ['usr_gender = ? AND last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\'', ['m']], orderBy: ['usr_display_name'] }, {}, (err, result) => (flowCallback(err, _.map(result, 'usr_display_name'))));
					break;
				case 'female':
					user.findAll(['usr_display_name'], { where: ['usr_gender = ? AND last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\'', ['f']], orderBy: ['usr_display_name'] }, {}, (err, result) => (flowCallback(err, _.map(result, 'usr_display_name'))));
					break;
				case 'pertanyaan':
					question.raw('SELECT usr_display_name, jumlah FROM (SELECT usr_id, COUNT(*) as jumlah FROM ?? WHERE submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\' GROUP BY usr_id) as question LEFT JOIN tbl_usrs ON tbl_usrs.ID = question.usr_id ORDER BY jumlah DESC, usr_display_name', (err, result) => (flowCallback(err, _.map(result, (o) => (o.usr_display_name + ': ' + o.jumlah)))));
					break;
				case 'jawaban':
					answer.raw('SELECT usr_display_name, jumlah FROM (SELECT answered_by, COUNT(*) as jumlah FROM ?? WHERE answered_date >= \'' + startDate + '\' AND answered_date < \'' + endDate + '\' GROUP BY answered_by) as answer LEFT JOIN tbl_usrs ON tbl_usrs.ID = answer.answered_by', (err, choicesResult) => {
						if (err) { return flowCallback(err); }
						essayAnswer.raw('SELECT usr_display_name, jumlah FROM (SELECT usr_id, COUNT(*) as jumlah FROM ?? WHERE submitted_date >= \'' + startDate + '\' AND submitted_date < \'' + endDate + '\' GROUP BY usr_id) as answer LEFT JOIN tbl_usrs ON tbl_usrs.ID = answer.usr_id', (err, essayResult) => {
							if (err) { return flowCallback(err); }

							flowCallback(null, _.chain(choicesResult).concat(essayResult).groupBy('usr_display_name').map((o, key) => ({usr_display_name: key, jumlah: _.sumBy(o, 'jumlah')})).orderBy(['jumlah', 'usr_display_name'], ['desc', 'asc']).map((o) => (o.usr_display_name + ': ' + o.jumlah)).value());
						});
					});
					break;
				case 'province':
					user.raw('SELECT name_prov FROM (SELECT usr_province FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_province) as location LEFT JOIN tbl_provinces ON tbl_provinces.id = location.usr_province ORDER BY name_prov', (err, result) => (flowCallback(err, _.map(result, 'name_prov'))));
					break;
				case 'regency':
					user.raw('SELECT name_kab FROM (SELECT usr_regency FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_regency) as location LEFT JOIN tbl_regencies ON tbl_regencies.id = location.usr_regency ORDER BY name_kab', (err, result) => (flowCallback(err, _.map(result, 'name_kab'))));
					break;
				case 'district':
					user.raw('SELECT name_kec FROM (SELECT usr_district FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_district) as location LEFT JOIN tbl_districts ON tbl_districts.id = location.usr_district ORDER BY name_kec', (err, result) => (flowCallback(err, _.map(result, 'name_kec'))));
					break;
				case 'village':
					user.raw('SELECT name_desa FROM (SELECT usr_village FROM ?? WHERE last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\' GROUP BY usr_village) as location LEFT JOIN tbl_villages ON tbl_villages.id = location.usr_village ORDER BY name_desa', (err, result) => (flowCallback(err, _.map(result, 'name_desa'))));
					break;
				default: return flowCallback(null, []);
			}
		},
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
};
