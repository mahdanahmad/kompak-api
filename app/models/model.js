const db	= require('../connection');
const async	= require('async');
const _		= require('lodash');

const globalError	= (errcode) => {
	switch (errcode) {
		case 'ER_DUP_ENTRY': return 'Duplicate primary key(s). Please check again your input.';
		case 'ER_NO_REFERENCED_ROW_2': return 'Foreign key(s) failed. Please check again your input.';
		case 'ER_ROW_IS_REFERENCED_2': return 'Primary key(s) in this table still used as referrence. Please delete those data first.';
		default: return errcode;
	}
}

class Model {
	constructor(tableName, fillable, required, preserved, hidden, id_alias, ...opts) {
		this.tableName  = tableName;
		this.tableId	= _.isNil(id_alias) ? 'id' : id_alias;
		this.fillable   = fillable;
		this.required   = required;
		this.preserved  = _.concat(this.tableId, preserved);
		this.selected	= _.chain(this.tableId).concat(fillable).difference(hidden).uniq().value();
	}

	insertOne(data, callback) {
		const missing   = _.difference(this.required, _.chain(data).pickBy((o) => (!_.isEmpty(o) || _.isDate(o))).keys().value());
		if (missing.length === 0) {
			db.get().query('INSERT INTO ' + this.tableName + ' SET ?', _.pick(data, this.fillable), (err, result) => {
				if (err) { return callback(globalError(err.code)); }
				callback(null, { id: result.insertId })
			});
		} else {
			callback('Missing required field(s) : {' + missing.join(', ') + '}.');
		}
	}

	find(id, callback) {
		db.get().query('SELECT ?? FROM ?? WHERE ' + this.tableId + ' = ?', [this.selected, this.tableName, id], (err, result) => {
			if (err) { return callback(globalError(err.code)); }
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
			if (err) { return callback(globalError(err.code)); }
			callback(null, _.isEmpty(result) ? null : result);
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
			if (err) { return callback(globalError(err.code)); }
			callback(null, _.isEmpty(result) ? null : result);
		});
	}

	update(id, update, callback) {
		db.get().query('SELECT ?? FROM ?? WHERE ' + this.tableId + ' = ?', [this.tableId, this.tableName, id], (err, result) => {
			if (err) { return callback(globalError(err.code)); }
			if (_.isEmpty(result)) { return callback(this.tableName + ' with id ' + id + ' not found.'); }

			let cherry    = _.pickBy(update, (o, key) => (_.chain(this.fillable).difference(this.preserved).includes(key).value() && (!_.isEmpty(o) || _.isDate(o))));
			if (!_.isEmpty(cherry)) {
				db.get().query('UPDATE ?? SET ' + _.map(cherry, (o, key) => (key + ' = ?')).join(',') + ' WHERE ' + this.tableId + ' = ?', [this.tableName, ..._.values(cherry), id], (err, result) => {
					if (err) { return callback(globalError(err.code)); }
					callback(null, _.keys(cherry));
				});
			} else {
				callback(null, []);
			}
		});
	}

	delete(id, callback) {
		db.get().query('SELECT ?? FROM ?? WHERE ' + this.tableId + ' = ?', [this.tableId, this.tableName, id], (err, result) => {
			if (err) { return callback(globalError(err.code)); }
			if (_.isEmpty(result)) { return callback(this.tableName + ' with id ' + id + ' not found.'); }

			db.get().query('DELETE FROM ?? where ' + this.tableId + ' = ?', [this.tableName, id], (err, result) => {
				if (err) { return callback(globalError(err.code)); }
				callback(null, result.value);
			});
		});
	}

}

module.exports = Model;
