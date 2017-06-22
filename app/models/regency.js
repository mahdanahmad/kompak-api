const Model     = require('./model');

const table     = 'tbl_regencies';
const fillable  = ['id', 'province_id', 'name_kab'];
const required  = ['id', 'province_id', 'name_kab'];
const preserved	= ['province_id'];
const hidden	= [];
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
