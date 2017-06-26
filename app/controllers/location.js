const _				= require('lodash');
const async			= require('async');

const province		= require('../models/province');
const regency		= require('../models/regency');
const district		= require('../models/district');
const village		= require('../models/village');

const globalMsg		= require('../helpers/messages');

const deepCounter	= (args, callback) => {
	const [provinceId, regencyId, districtId, villageId] = args;

	async.waterfall([
		(flowCallback) => {
			if (!_.isNil(provinceId)) {
				province.find(provinceId, (err, result) => {
					if (err) { return flowCallback([err]); }
					if (_.isNil(result)) { return flowCallback(['Provinces with id ' + provinceId + ' not found.']); }

					flowCallback(null, result.name_prov);
				});
			} else {
				flowCallback([null, { state: 'top' }]);
			}
		},
		(name, flowCallback) => {
			if (!_.isNil(regencyId)) {
				regency.findOne({ where: ['province_id = ? AND id = ?', [provinceId, regencyId]]}, (err, result) => {
					if (err) { return flowCallback([err]); }
					if (_.isNil(result)) { return flowCallback(['Regency with id ' + regencyId + ' from province_id ' + provinceId + ' not found.']); }

					flowCallback(null, result.name_kab);
				});
			} else {
				flowCallback([null, { state: 'province', name }]);
			}
		},
		(name, flowCallback) => {
			if (!_.isNil(districtId)) {
				district.findOne({ where: ['regency_id = ? AND id = ?', [regencyId, districtId]]}, (err, result) => {
					if (err) { return flowCallback([err]); }
					if (_.isNil(result)) { return flowCallback(['District with id ' + districtId + ' from province_id ' + provinceId + ' and regency_id ' + regencyId + ' not found.']); }

					flowCallback(null, result.name_kec);
				});
			} else {
				flowCallback([null, { state: 'regency', name }]);
			}
		},
		(name, flowCallback) => {
			if (!_.isNil(villageId)) {
				village.findOne({ where: ['district_id = ? AND id = ?', [districtId, villageId]]}, (err, result) => {
					if (err) { return flowCallback([err]); }
					if (_.isNil(result)) { return flowCallback(['Village with id ' + villageId + ' from province_id ' + provinceId + ', regency_id ' + regencyId + ' and district_id ' + districtId + ' not found.']); }

					flowCallback([null, { state: 'village', name: result.name_desa }]);
				});
			} else {
				flowCallback([null, { state: 'district', name }]);
			}
		}
	], ([err, asyncResult]) => {
		callback(err, asyncResult);
	});
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
module.exports.index = (args, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all locations success.';
	let result          = null;

	const limit			= !_.isNil(input.limit)		? _.toInteger(input.limit)	: 0;
	const offset		= !_.isNil(input.offset)	? _.toInteger(input.offset)	: 0;

	const [provinceId, regencyId, districtId, villageId] = args;

	async.waterfall([
		(flowCallback) => {
			deepCounter(args, (err, result) => {
				if (err) { return flowCallback(err); }
				let collection, tableId, tableName, id = null;
				switch (result.state) {
					case 'province'	: collection = regency; tableId = 'province_id'; id = provinceId; tableName = 'name_kab'; break;
					case 'regency'	: collection = district; tableId = 'regency_id'; id = regencyId; tableName = 'name_kec'; break;
					case 'district'	: collection = village; tableId = 'district_id'; id = districtId; tableName = 'name_desa'; break;
					case 'village'	: collection = village; tableId = 'id'; id = villageId; break;
					default: collection = province; tableName = 'name_prov';
				}

				let like		= !_.isNil(input.like) ? [tableName + ' LIKE ?', '%' + input.like + '%'] : null;
				let prevId		= !_.isNil(tableId) ? [tableId + ' = ?', id] : null;
				let where		= _.compact([like, prevId])

				let query	= _.omitBy({
					where: (where.length > 0) ? [_.chain(where).map((o) => (o[0])).join(' AND ').value(), _.flatMap(where, (o) => (o[1]))] : null,
					orderBy: [tableName],
				}, _.isNil);

				let name	= result.name;
				collection.findAll(query, {limit, offset}, (err, result) => (flowCallback(err, { data: result, name })));
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
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $input
 * @return Response
 */
module.exports.store = (args, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Insert new location success.';
	let result          = null;

	const id			= !_.isNil(input.id)	? input.id		: null;
	const name			= !_.isNil(input.name)	? input.name	: null;

	const [provinceId, regencyId, districtId, villageId] = args;

	async.waterfall([
		(flowCallback) => {
			let missingparams	= [];
			if (_.isNil(id)) { missingparams.push('id'); }
			if (_.isNil(name)) { missingparams.push('name'); }

			if (missingparams.length) {
				flowCallback('Missing required field(s) : {' + missingparams.join(', ') + '}.');
			} else {
				flowCallback();
			}
		},
		(flowCallback) => {
			deepCounter(args, (err, result) => {
				if (err) { return flowCallback(err); }
				let collection, prevTable, prevId, tableName = null;
				switch (result.state) {
					case 'province'	: collection = regency; prevTable = 'province_id'; prevId = provinceId; tableName = 'name_kab'; break;
					case 'regency'	: collection = district; prevTable = 'regency_id'; prevId = regencyId; tableName = 'name_kec'; break;
					case 'district'	: collection = village; prevTable = 'district_id'; prevId = districtId; tableName = 'name_desa'; break;
					case 'village'	: return flowCallback('No data can be added to this point.');
					default: collection = province; tableName = 'name_prov';
				}

				// let data	= { id : (!_.isNil(prevId) ? prevId : '') + id };
				let data	= { id };
				data[tableName]	= name;
				if (prevId) { data[prevTable] = prevId; }

				collection.insertOne(data, (err, result) => (flowCallback(err, { id })));
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
	//
};

/**
 * Update the specified resource in storage.
 *
 * @param  int  $id
 * @param  Request  $request
 * @return Response
 */
module.exports.update = (args, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Update data location success.';
	let result			= null;

	const name			= !_.isNil(input.name)	? input.name	: null;

	const [provinceId, regencyId, districtId, villageId] = args;

	async.waterfall([
		(flowCallback) => {
			deepCounter(args, (err, result) => {
				if (err) { return flowCallback(err); }
				let collection, tableName, id = null;
				switch (result.state) {
					case 'province'	: collection = province; tableName = 'name_prov'; id = provinceId; break;
					case 'regency'	: collection = regency; tableName = 'name_kab'; id = regencyId; break;
					case 'district'	: collection = district; tableName = 'name_kec'; id = districtId; break;
					case 'village'	: collection = village; tableName = 'name_desa'; id = villageId; break;
					default: return flowCallback('No data can be edited in this point.');
				}

				let data	= {};
				data[tableName]	= name;

				collection.update(id, data, (err, result) => (flowCallback(err, result)));
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
module.exports.destroy = (args, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Remove location success.';
	let result          = null;

	const [provinceId, regencyId, districtId, villageId] = args;

	async.waterfall([
		(flowCallback) => {
			deepCounter(args, (err, result) => {
				if (err) { return flowCallback(err); }
				let collection, id = null;
				switch (result.state) {
					case 'province'	: collection = province; id = provinceId; break;
					case 'regency'	: collection = regency; id = regencyId; break;
					case 'district'	: collection = district; id = districtId; break;
					case 'village'	: collection = village; id = villageId; break;
					default: return flowCallback('No data can be deleted in this point.');
				}

				collection.delete(id, (err, result) => (flowCallback(err, result)));
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
