const _				= require('lodash');
const async			= require('async');

const essayAnswer	= require('../models/essayAnswer');

const globalMsg		= require('../helpers/messages');

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
module.exports.index = (input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all essay answers success.';
	let result          = null;

	const limit			= !_.isNil(input.limit)		? _.toInteger(input.limit)	: 0;
	const offset		= !_.isNil(input.offset)	? _.toInteger(input.offset)	: 0;

	async.waterfall([
		(flowCallback) => {
			let like		= !_.isNil(input.like) ? ['tbl_usrs.usr_display_name LIKE ?', '%' + input.like + '%'] : null;
			let category	= !_.isNil(input.category) ? ['tbl_essai.ID_category = ?', input.category] : null;
			let where		= _.compact([like, category])

			let query	= _.omitBy({
				leftJoin: ['tbl_essai ON tbl_essai_answers.id_essai_question = tbl_essai.id LEFT JOIN tbl_usrs ON tbl_essai_answers.usr_id = tbl_usrs.ID'],
				where: (where.length > 0) ? [_.chain(where).map((o) => (o[0])).join(' AND ').value(), _.flatMap(where, (o) => (o[1]))] : null,
				orderBy: ['submitted_date DESC'],
			}, _.isNil);
			let selected	= ['answer', 'tbl_essai_answers.submitted_date', 'tbl_usrs.usr_display_name', 'tbl_essai.question'];

			essayAnswer.findAll(selected, query, {limit, offset}, (err, result) => {
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
	let message         = 'Insert new essay answer success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			const ascertain	= { submitted_date: new Date() }
			essayAnswer.insertOne(_.assign(input, ascertain), (err, result) =>{
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
	let message         = 'Get essay answer with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			essayAnswer.find(id, (err, result) => {
				if (err) { return flowCallback(err); }
				if (_.isNil(result)) { return flowCallback('Essay answer with id ' + id + ' not found.'); }

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
	let message         = 'Update data essay answer with id ' + id + ' success.';
	let result			= null;

	async.waterfall([
		(flowCallback) => {
			essayAnswer.update(id, input, (err, result) => {
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
	let message         = 'Remove essay answer with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			essayAnswer.delete(id, input, (err, result) => {
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
