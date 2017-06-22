const Model     = require('./model');

const table     = 'tbl_questions_categories';
const fillable  = ['category_name', 'category_description', 'category_enabled'];
const required  = ['category_name'];
const preserved	= [];
const hidden	= [];
const id_alias	= 'ID_category';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
