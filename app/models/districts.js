const Model     = require('./model');

const table     = 'tbl_districts';
const fillable  = ['id', 'regency_id', 'name_kec'];
const required  = ['id', 'regency_id', 'name_kec'];
const preserved	= ['regency_id'];
const hidden	= [];
const ascertain	= {};
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, ascertain, id_alias);
	}
}

module.exports = new Collection();
