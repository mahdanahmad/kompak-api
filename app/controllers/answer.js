const _				= require('lodash');
const async			= require('async');
const moment		= require('moment');

const answer		= require('../models/answer');

const globalMsg		= require('../helpers/messages');

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
module.exports.index = (input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all answers success.';
	let result          = null;

	const limit			= !_.isNil(input.limit)		? _.toInteger(input.limit)	: 0;
	const offset		= !_.isNil(input.offset)	? _.toInteger(input.offset)	: 0;

	const dateFormat	= 'YYYY-MM-DD HH:mm:ss';
	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			let like		= !_.isNil(input.like) ? ['tbl_usrs.usr_display_name LIKE ?', '%' + input.like + '%'] : null;
			let category	= !_.isNil(input.category) ? ['tbl_questions.question_category = ?', input.category] : null;
			let where		= _.compact([like, category])
			let whereQuery	= (where.length > 0) ? [_.chain(where).map((o) => (o[0])).join(' AND ').value(), _.flatMap(where, (o) => (o[1]))] : null;

			let query	= _.omitBy({
				leftJoin: ['tbl_questions ON tbl_user_answer.question_id = tbl_questions.ID_question LEFT JOIN tbl_usrs ON tbl_user_answer.answered_by = tbl_usrs.ID'],
				where: ['answered_date >= \'' + startDate + '\' AND answered_date < \'' + endDate + '\'' + (!_.isNil(whereQuery) ? ' AND ' + whereQuery[0] : ''), (!_.isNil(whereQuery) ? whereQuery[1] : [])],
				orderBy: ['answered_date DESC'],
			}, _.isNil);
			let selected	= ['status_answer', 'answered_date', 'tbl_usrs.usr_display_name', 'tbl_questions.question_text'];

			answer.findAll(selected, query, {limit, offset}, (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, result);
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
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $input
 * @return Response
 */
module.exports.store = (input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Insert new answer success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			const ascertain	= { answered_date: new Date() }
			answer.insertOne(_.assign(input, ascertain), (err, result) =>{
				if (err) { return flowCallback(err); }

				flowCallback(null, result);
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
};

/**
 * Display the specified resource.
 *
 * @param  int	$id
 * @return Response
 */
module.exports.show = (id, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get answer with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			answer.find(id, (err, result) => {
				if (err) { return flowCallback(err); }
				if (_.isNil(result)) { return flowCallback('Answer with id ' + id + ' not found.'); }

				flowCallback(null, result);
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
};

/**
 * Update the specified resource in storage.
 *
 * @param  int  $id
 * @param  Request  $request
 * @return Response
 */
module.exports.update = (id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Update data answer with id ' + id + ' success.';
	let result			= null;

	async.waterfall([
		(flowCallback) => {
			const ascertain	= { modified_date : new Date() };
			answer.update(id, _.assign(input, ascertain), (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, result);
			});
		},
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else if (_.isEmpty(asyncResult)) {
			message += ' No data changed.';
		} else {
			message += ' Changed data : {' + asyncResult.join(', ') + '}';
		}
		callback({ response, status_code, message, result });
	});
};

/**
 * Remove the specified resource from storage.
 *
 * @param  	int	$id
 * @return	Response
 */
module.exports.destroy = (id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Remove answer with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			answer.delete(id, input, (err, result) => {
				if (err) { return flowCallback(err); }

				flowCallback(null, null);
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
};
