const db	= require('../connection');
const async	= require('async');
const _		= require('lodash');

class Model {
	constructor(tableName, fillable, required, preserved, hidden, ascertain, id_alias, ...opts) {
		this.tableName  = tableName;
		this.tableId	= _.isNil(id_alias) ? 'id' : id_alias;
		this.fillable   = fillable;
		this.required   = required;
		this.preserved  = preserved;
		this.selected	= _.chain(this.tableId).concat(fillable).difference(hidden).value();
		this.ascertain	= ascertain;
	}

	insertOne(data, callback) {
		const missing   = _.difference(this.required, _.chain(data).pickBy((o) => (!_.isEmpty(o))).keys().value());
		if (missing.length === 0) {
			async.mapValues(_.pickBy(this.ascertain, (o, key) => (_.includes(_.keys(data), key))), (tableTarget, dataKey, filterCallback) => {
				// if (_.isArray(data[dataKey])) {
				// 	async.filter(_.uniq(data[dataKey]), (val, next) => {
				// 		db.getCollection(tableTarget).findOne({ _id: db.toObjectID(val), deleted_at: { $exists: false } }, (err, result) => {
				// 			next(null, !_.isNull(result));
				// 		});
				// 	}, (err, filtered) => {
				// 		filterCallback(null, filtered);
				// 	});
				// } else {
				// 	db.getCollection(tableTarget).findOne({ _id: db.toObjectID(data[dataKey]), deleted_at: { $exists: false } }, (err, result) => {
				// 		filterCallback(null, !_.isNil(result) ? data[dataKey] : null);
				// 	});
				// }
				filterCallback(null);
			}, (err, results) => {
				if (err) { return callback(err); }

				const filtered = _.chain(results).pickBy((o) => (_.isNil(o) || _.isEmpty(o))).keys().intersection(this.required).value();
				if (filtered.length > 0) {
					callback('Missing required field(s) : {' + filtered.join(', ') + '}.');
				} else {
					db.get().query('INSERT INTO ' + this.tableName + ' SET ?', _.pick(data, this.fillable), (err, result) => {
						if (err) { return callback(err); }
						callback(null, { id: result.insertId })
					});
				}
			});
		} else {
			callback('Missing required field(s) : {' + missing.join(', ') + '}.');
		}
	}

	find(id, callback) {
		db.get().query('SELECT ?? FROM ?? WHERE ' + this.tableId + ' = ?', [this.selected, this.tableName, id], (err, result) => {
			if (err) { return callback(err); }
			callback(null, _.isEmpty(result) ? null : result);
		});
	}

	findOne(...args) {
		let queryLine = null, queryValue = [], callback = null;

		switch (args.length) {
			case 1: [callback] = args; break;
			case 3: [queryLine, queryValue, callback] = args; break;
			default: callback = _.last(args);
		}

		db.get().query('SELECT ?? FROM ??' + (queryLine ? ' WHERE ' + queryLine : '') + ' LIMIT 1', [this.selected, this.tableName, ...(queryValue ? queryValue : [])], (err, result) => {
			if (err) { return callback(err); }
			callback(null, result);
		});
	}

	findAll(...args) {
		let queryLine = null, queryValue = [], opts = {}, callback = null;

		switch (args.length) {
			case 1: [callback] = args; break;
			case 2: [opts, callback] = args; break;
			case 4: [queryLine, queryValue, opts, callback] = args; break;
			default: callback = _.last(args);
		}

		const limit 	= !_.isNil(opts.limit) && _.isInteger(opts.limit)	? opts.limit    : 0;
		const offset	= !_.isNil(opts.offset) && _.isInteger(opts.offset)	? opts.offset	: 0;
		db.get().query('SELECT ?? FROM ??' + (queryLine ? ' WHERE ' + queryLine : '') + (limit ? ' LIMIT ' + [offset, limit].join(',') : ''), [this.selected, this.tableName, ...queryValue], (err, result) => {
			if (err) { return callback(err); }
			callback(null, result);
		});
	}

	update(id, update, callback) {
		db.get().query('SELECT ?? FROM ?? WHERE ' + this.tableId + ' = ?', [this.tableId, this.tableName, id], (err, result) => {
			if (err) { return callback(err); }
			if (_.isEmpty(result)) { return callback(this.tableName + ' with id ' + id + ' not found.'); }

			let cherry    = _.pickBy(update, (o, key) => (_.chain(this.fillable).difference(this.preserved).includes(key).value() && !_.isEmpty(o)));
			if (!_.isEmpty(cherry)) {
				async.mapValues(_.pickBy(this.ascertain, (o, key) => (_.includes(_.keys(cherry), key))), (tableTarget, dataKey, filterCallback) => {
					// if (_.isArray(cherry[dataKey])) {
					// 	async.filter(_.uniq(cherry[dataKey]), (val, next) => {
					// 		db.getCollection(tableTarget).findOne({ _id: db.toObjectID(val), deleted_at: { $exists: false } }, (err, result) => {
					// 			next(null, !_.isNull(result));
					// 		});
					// 	}, (err, filtered) => {
					// 		filterCallback(null, filtered);
					// 	});
					// } else {
					// 	db.getCollection(tableTarget).findOne({ _id: db.toObjectID(cherry[dataKey]), deleted_at: { $exists: false } }, (err, result) => {
					// 		filterCallback(null, !_.isNil(result) ? cherry[dataKey] : null);
					// 	});
					// }
					flowCallback(null);
				}, (err, results) => {
					if (err) { return callback(err); }

					const ommited	= _.chain(results).pickBy((o) => (_.isNil(o) || _.isEmpty(o))).keys().value();
					cherry	= _.chain(cherry).assign(results).omit(ommited).value();
					db.get().query('UPDATE ?? SET ' + _.map(cherry, (o, key) => (key + ' = ?')).join(',') + ' WHERE ' + this.tableId + ' = ?', [this.tableName, ..._.values(cherry), id], (err, result) => {
						if (err) { return callback(err); }
						callback(null, _.keys(cherry));
					});
				});
			} else {
				callback(null, []);
			}
		});
	}

	delete(id, callback) {
		db.get().query('SELECT ?? FROM ?? WHERE ' + this.tableId + ' = ?', [this.tableId, this.tableName, id], (err, result) => {
			if (err) { return callback(err); }
			if (_.isEmpty(result)) { return callback(this.tableName + ' with id ' + id + ' not found.'); }

			db.get().query('DELETE FROM ?? where ' + this.tableId + ' = ?', [this.tableName, id], (err, result) => {
				if (err) { return callback(err); }
				callback(null, result.value);
			});
		});
	}

}

module.exports = Model;
