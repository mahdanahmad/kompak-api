const Model     = require('./model');

const table     = 'tbl_essai';
const fillable  = ['ID_category', 'question', 'submitted_date'];
const required  = ['ID_category', 'question'];
const preserved	= ['submitted_date'];
const hidden	= [];
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
