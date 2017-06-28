const _				= require('lodash');
const moment		= require('moment');
const async			= require('async');

const user  		= require('../models/user');
const essay  		= require('../models/essay');
const answer  		= require('../models/answer');
const province		= require('../models/province');
const question		= require('../models/question');
const essayAnswer	= require('../models/essayAnswer');

const globalMsg		= require('../helpers/messages');

module.exports.statistic = (callback) => {
	let response		= 'OK';
	let status_code     = 200;
	let message         = 'Get statistic success.';
	let result          = null;

	let topLimit		= 10;
	let dateLimit		= moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');

	async.waterfall([
		(flowCallback) => {
			let location	= ['province', 'regency', 'district', 'village'];
			let gender		= ['m', 'f'];
			let ageStep		= [15, 45, 5];
			let age			= _.chain((ageStep[1] - ageStep[0]) / ageStep[2]).times((o) => { let minAge = o * ageStep[2] + ageStep[0]; return [minAge, minAge + ageStep[2]]; }).concat(_.dropRight(ageStep)).value();

			let total		= 'COUNT(*) as total';
			let countLoc	= _.chain(location).map((o) => ('COUNT(DISTINCT usr_' + o + ') as ' + o + '')).join(', ').value();
			let countGender	= _.chain(gender).map((o) => ('SUM(if(usr_gender = \'' + o + '\', 1, 0)) as ' + o)).join(', ').value();
			let countAge	= _.chain(age).map((o) => ('SUM(if(' + (_.isArray(o) ? ('usr_years >= ' + o[0] + ' AND usr_years < ' + o[1]) : (o == ageStep[0] ? 'usr_years < ' + o : 'usr_years >=' + o)) + ', 1, 0)) as \'' + (_.isArray(o) ? o.join(' - ') : (o == ageStep[0] ? '< ' + o : o + ' >=' )) + '\'')).join().value();
			let countLogin	= 'SUM(if(last_logged_in >= \'' + dateLimit + '\', 1, 0)) as login';

			let selected	= [total, countLoc, countGender, countAge, countLogin].join(', ');

			user.raw('SELECT ' + selected + ' FROM ??', (err, result) => flowCallback(err, {
				gender: _.pick(result[0], gender),
				status: _.pick(result[0], _.concat(location, 'total', 'login')),
				age: _.pick(result[0], _.map(age, (o) => (_.isArray(o) ? o.join(' - ') : (o == ageStep[0] ? '< ' + o : o + ' >=' ))))
			}));
		},
		(data, flowCallback) => {
			async.parallel([
				(callback) => { essay.raw('SELECT SUM(if(submitted_date >= \'' + dateLimit + '\',1,0)) as count from ??', (err, result) => callback(err, result[0].count)); },
				(callback) => { answer.raw('SELECT SUM(if(answered_date >= \'' + dateLimit + '\',1,0)) as count from ??', (err, result) => callback(err, result[0].count)); },
				(callback) => { question.raw('SELECT SUM(if(submitted_date >= \'' + dateLimit + '\',1,0)) as count from ??', (err, result) => callback(err, result[0].count)); },
				(callback) => { essayAnswer.raw('SELECT SUM(if(submitted_date >= \'' + dateLimit + '\',1,0)) as count from ??', (err, result) => callback(err, result[0].count)); },
			], (err, results) => {
				if (err) { return flowCallback(err); }
				_.assign(data.status, { transaction: _.sum(results) });
				flowCallback(null, data);
			});
		},
		(data, flowCallback) => {
			async.parallel({
				topscore: (callback) => { user.findAll(['usr_display_name', 'usr_score'], { orderBy: ['usr_score DESC'] }, { limit: topLimit }, (err, result) => callback(err, result)); },
				topcontribution: (callback) => { user.findAll(['usr_display_name', 'usr_contribution'], { orderBy: ['usr_contribution DESC'] }, { limit: topLimit }, (err, result) => callback(err, result)); },
				topvillage: (callback) => { user.raw('SELECT tbl_villages.name_desa, topVillage.jumlah FROM (SELECT usr_village, COUNT(*) as jumlah FROM ?? GROUP BY usr_village ORDER BY jumlah DESC LIMIT 0, ' + topLimit + ') as topVillage LEFT JOIN tbl_villages ON topVillage.usr_village = tbl_villages.id', (err, result) => callback(err, result)); },
				notMyProvince: (callback) => { province.raw('SELECT name_prov FROM ?? WHERE id NOT IN (SELECT usr_province FROM tbl_usrs)', (err, result) => callback(err, _.map(result, 'name_prov'))); },
			}, (err, results) => flowCallback(err, _.assign(data, results)));
		},
		(data, flowCallback) => {
			async.parallel({
				institution: (callback) => { user.raw('SELECT tbl_institution.name_institution, countInstitution.jumlah FROM (SELECT usr_institution, count(*) as jumlah FROM ?? GROUP BY usr_institution) as countInstitution RIGHT JOIN tbl_institution ON countInstitution.usr_institution = tbl_institution.id', (err, result) => callback(err, _.map(result, (o) => ({ name: o.name_institution, jumlah: (o.jumlah || 0) })))); },
				education: (callback) => { user.raw('SELECT tbl_education.education, countEducation.jumlah FROM (SELECT usr_education, count(*) as jumlah FROM ?? GROUP BY usr_education) as countEducation RIGHT JOIN tbl_education ON countEducation.usr_education = tbl_education.id', (err, result) => callback(err, _.map(result, (o) => ({ name: o.education, jumlah: (o.jumlah || 0) })))); },
				designation: (callback) => { user.raw('SELECT usr_designation, COUNT(*) as jumlah FROM ?? GROUP BY usr_designation ORDER BY jumlah DESC LIMIT 0,8', (err, result) => callback(err, result)); },
			}, (err, results) => flowCallback(err, _.assign(data, results)));
		},
		(data, flowCallback) => {
			async.parallel({
				easiestquestion: (callback) => { question.raw('SELECT question_text FROM ?? WHERE (no_of_times_correctly_answered - no_of_times_incorrectly_answered) = (SELECT max(no_of_times_correctly_answered - no_of_times_incorrectly_answered) FROM tbl_questions) ORDER BY no_of_times_correctly_answered DESC LIMIT 1', (err, result) => callback(err, _.get(result, [0, 'question_text'], ''))); },
				hardestquestion: (callback) => { question.raw('SELECT question_text FROM ?? WHERE (no_of_times_correctly_answered - no_of_times_incorrectly_answered) = (SELECT min(no_of_times_correctly_answered - no_of_times_incorrectly_answered) FROM tbl_questions) ORDER BY no_of_times_correctly_answered ASC LIMIT 1', (err, result) => callback(err, _.get(result, [0, 'question_text']))); },
				easiestcategory: (callback) => { question.raw('SELECT tbl_questions_categories.category_name FROM (SELECT question_category, SUM(no_of_times_correctly_answered - no_of_times_incorrectly_answered) as ansAvg FROM ?? GROUP BY question_category ORDER BY ansAvg LIMIT 1) as lowQuest LEFT JOIN tbl_questions_categories ON lowQuest.question_category = tbl_questions_categories.ID_category', (err, result) => callback(err, _.get(result, [0, 'category_name'], ''))); },
				hardestcategory: (callback) => { question.raw('SELECT tbl_questions_categories.category_name FROM (SELECT question_category, SUM(no_of_times_correctly_answered - no_of_times_incorrectly_answered) as ansAvg FROM ?? GROUP BY question_category ORDER BY ansAvg DESC LIMIT 1) as lowQuest LEFT JOIN tbl_questions_categories ON lowQuest.question_category = tbl_questions_categories.ID_category', (err, result) => callback(err, _.get(result, [0, 'category_name'], ''))); },
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
