const Model     = require('./model');

const table     = 'tbl_villages';
const fillable  = ['id', 'district_id', 'name_desa'];
const required  = ['id', 'district_id', 'name_desa'];
const preserved	= ['district_id'];
const hidden	= [];
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
