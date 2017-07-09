const _				= require('lodash');
const async			= require('async');

const question		= require('../models/question');

const globalMsg		= require('../helpers/messages');

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
module.exports.index = (input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all questions success.';
	let result          = null;

	const limit			= !_.isNil(input.limit)		? _.toInteger(input.limit)	: 0;
	const offset		= !_.isNil(input.offset)	? _.toInteger(input.offset)	: 0;

	async.waterfall([
		(flowCallback) => {
			let like		= !_.isNil(input.like) ? ['question_text LIKE ?', '%' + input.like + '%'] : null;
			let category	= !_.isNil(input.category) ? ['question_category = ?', input.category] : null;
			let where		= _.compact([like, category])

			let query	= _.omitBy({
				leftJoin: ['tbl_questions_categories ON tbl_questions.question_category = tbl_questions_categories.ID_category LEFT JOIN tbl_usrs ON tbl_questions.usr_id = tbl_usrs.ID'],
				where: (where.length > 0) ? [_.chain(where).map((o) => (o[0])).join(' AND ').value(), _.flatMap(where, (o) => (o[1]))] : null,
				orderBy: ['question_enabled'],
			}, _.isNil);
			let selected	= ['question_text', 'response_1', 'response_2', 'response_3', 'response_4', 'question_enabled', 'ID_category', 'correct_response', 'tbl_questions_categories.category_name', 'tbl_usrs.usr_display_name'];

			question.findAll(selected, query, {limit, offset}, (err, result) => {
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
	let message         = 'Insert new question success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			const ascertain	= { no_of_times_correctly_answered: 0, no_of_times_incorrectly_answered: 0, no_of_times_presented_as_challenge: 0, no_of_times_response_1: 0, no_of_times_response_2: 0, no_of_times_response_3: 0, no_of_times_response_4: 0, submitted_date: new Date() }
			question.insertOne(_.assign(input, ascertain), (err, result) =>{
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
	let message         = 'Get question with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			question.find(id, (err, result) => {
				if (err) { return flowCallback(err); }
				if (_.isNil(result)) { return flowCallback('Question with id ' + id + ' not found.'); }

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
	let message         = 'Update data question with id ' + id + ' success.';
	let result			= null;

	async.waterfall([
		(flowCallback) => {
			const ascertain	= { modified_date : new Date() };
			question.update(id, _.assign(input, ascertain), (err, result) => {
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
	let message         = 'Remove question with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			question.delete(id, input, (err, result) => {
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
