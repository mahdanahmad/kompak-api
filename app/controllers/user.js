const _				= require('lodash');
const async			= require('async');
const moment		= require('moment');

const user  		= require('../models/user');

const globalMsg		= require('../helpers/messages');

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
module.exports.index = (input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all users success.';
	let result          = null;

	const limit			= !_.isNil(input.limit)		? _.toInteger(input.limit)	: 0;
	const offset		= !_.isNil(input.offset)	? _.toInteger(input.offset)	: 0;

	const dateFormat	= 'YYYY-MM-DD HH:mm:ss';
	const startDate		= !_.isNil(input.startdate)	? moment(input.startdate).format(dateFormat)	: moment().year(2017).startOf('year').format(dateFormat);
	const endDate		= !_.isNil(input.enddate)	? moment(input.enddate).format(dateFormat)		: moment().format(dateFormat);

	async.waterfall([
		(flowCallback) => {
			let query		= _.omitBy({
				leftJoin: ['tbl_villages ON tbl_usrs.usr_village = tbl_villages.id LEFT JOIN tbl_institution ON tbl_usrs.usr_institution = tbl_institution.id'],
				where: ['last_logged_in >= \'' + startDate + '\' AND last_logged_in < \'' + endDate + '\'' + (!_.isNil(input.like) ? ' AND usr_display_name LIKE ?' : ''), (!_.isNil(input.like) ? ['%' + input.like + '%'] : [])],
				orderBy: !_.isNil(input.orderby) ? [input.orderby]	: null
			}, _.isNil);
			let selected	= ['usr_email', 'usr_display_name', 'usr_designation', 'usr_gender', 'tbl_villages.name_desa', 'usr_year_born', 'usr_contribution', 'usr_score', 'tbl_institution.name_institution'];

			user.findAll(selected, query, {limit, offset}, (err, result) => flowCallback(err, result));
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

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $input
 * @return Response
 */
module.exports.store = (input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Insert new user success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			const ascertain	= { usr_score: 0, usr_contribution: 0, no_of_times_logged_in: 0, code_reset: 0 };
			user.insertOne(_.assign(input, ascertain), (err, result) =>{
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
	let message         = 'Get user with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			user.find(id, (err, result) => {
				if (err) { return flowCallback(err); }
				if (_.isNil(result)) { return flowCallback('User with id ' + id + ' not found.'); }

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
	let message         = 'Update data user with id ' + id + ' success.';
	let result			= null;

	async.waterfall([
		(flowCallback) => {
			user.update(id, input, (err, result) => {
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
	let message         = 'Remove user with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			user.delete(id, input, (err, result) => {
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
