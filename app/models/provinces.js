const Model     = require('./model');

const table     = 'tbl_provinces';
const fillable  = ['id', 'name_prov'];
const required  = ['id', 'name_prov'];
const preserved	= [];
const hidden	= [];
const ascertain	= {};
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, ascertain, id_alias);
	}
}

module.exports = new Collection();
