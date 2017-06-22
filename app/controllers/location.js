const _				= require('lodash');
const async			= require('async');

const provinces		= require('../models/provinces');
const regencies		= require('../models/regencies');
const districts		= require('../models/districts');
const villages		= require('../models/villages');

const globalMsg		= require('../helpers/messages');

const deepCounter	= (args, callback) => {
	const [provinceId, regencyId, districtId, villageId] = args;

	async.waterfall([
		(flowCallback) => {
			if (!_.isNil(provinceId)) {
				provinces.find(provinceId, (err, result) => {
					if (err) { return flowCallback([err]); }
					if (_.isNil(result)) { return flowCallback(['Provinces with id ' + provinceId + ' not found.']); }

					flowCallback(null);
				});
			} else {
				flowCallback([null, 'top']);
			}
		},
		(flowCallback) => {
			if (!_.isNil(regencyId)) {
				regencies.findOne('province_id = ? AND id = ?', [provinceId, regencyId], (err, result) => {
					if (err) { return flowCallback([err]); }
					if (_.isNil(result)) { return flowCallback(['Regency with id ' + regencyId + ' from province_id ' + provinceId + ' not found.']); }

					flowCallback(null);
				});
			} else {
				flowCallback([null, 'province']);
			}
		},
		(flowCallback) => {
			if (!_.isNil(districtId)) {
				districts.findOne('regency_id = ? AND id = ?', [regencyId, districtId], (err, result) => {
					if (err) { return flowCallback([err]); }
					if (_.isNil(result)) { return flowCallback(['District with id ' + districtId + ' from province_id ' + provinceId + ' and regency_id ' + regencyId + ' not found.']); }

					flowCallback(null);
				});
			} else {
				flowCallback([null, 'regency']);
			}
		},
		(flowCallback) => {
			if (!_.isNil(villageId)) {
				villages.findOne('district_id = ? AND id = ?', [districtId, villageId], (err, result) => {
					if (err) { return flowCallback([err]); }
					if (_.isNil(result)) { return flowCallback(['Village with id ' + villageId + ' from province_id ' + provinceId + ', regency_id ' + regencyId + ' and district_id ' + districtId + ' not found.']); }

					flowCallback([null, 'village']);
				});
			} else {
				flowCallback([null, 'district']);
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
				let collection, tableId, id = null;
				switch (result) {
					case 'province'	: collection = regencies; tableId = 'province_id'; id = provinceId; break;
					case 'regency'	: collection = districts; tableId = 'regency_id'; id = regencyId; break;
					case 'district'	: collection = villages; tableId = 'district_id'; id = districtId; break;
					case 'village'	: collection = villages; tableId = 'id'; id = villageId; break;
					default: collection = provinces;
				}

				collection.findAll((tableId ? tableId + ' = ?' : 1), [id], {limit, offset}, (err, result) => (flowCallback(err, result)));
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
				let collection, prevTable, prevId, nameTable = null;
				switch (result) {
					case 'province'	: collection = regencies; prevTable = 'province_id'; prevId = provinceId; nameTable = 'name_kab'; break;
					case 'regency'	: collection = districts; prevTable = 'regency_id'; prevId = regencyId; nameTable = 'name_kec'; break;
					case 'district'	: collection = villages; prevTable = 'district_id'; prevId = districtId; nameTable = 'name_desa'; break;
					case 'village'	: return flowCallback('No data can be added to this point.');
					default: collection = provinces; nameTable = 'name_prov';
				}

				let data	= { id : (!_.isNil(prevId) ? prevId : '') + id };
				data[nameTable]	= name;
				if (prevId) { data[prevTable] = prevId; }

				collection.insertOne(data, (err, result) => (flowCallback(err, result)));
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
				let collection, nameTable, id = null;
				switch (result) {
					case 'province'	: collection = provinces; nameTable = 'name_prov'; id = provinceId; break;
					case 'regency'	: collection = regencies; nameTable = 'name_kab'; id = regencyId; break;
					case 'district'	: collection = districts; nameTable = 'name_kec'; id = districtId; break;
					case 'village'	: collection = villages; nameTable = 'name_desa'; id = villageId; break;
					default: return flowCallback('No data can be edited in this point.');
				}

				let data	= {};
				data[nameTable]	= name;

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
				switch (result) {
					case 'province'	: collection = provinces; id = provinceId; break;
					case 'regency'	: collection = regencies; id = regencyId; break;
					case 'district'	: collection = districts; id = districtId; break;
					case 'village'	: collection = villages; id = villageId; break;
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
