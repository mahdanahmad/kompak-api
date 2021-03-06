const Model     = require('./model');

const table     = 'tbl_institution';
const fillable  = ['name_institution'];
const required  = ['name_institution'];
const preserved	= [];
const hidden	= [];
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
