const Model     = require('./model');

const table     = 'tbl_education';
const fillable  = ['education'];
const required  = ['education'];
const preserved	= [];
const hidden	= [];
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
