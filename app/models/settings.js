const Model     = require('./model');

const table     = 'tbl_settings';
const fillable  = ['version', 'num_top_skor_list', 'life'];
const required  = ['version', 'num_top_skor_list', 'life'];
const preserved	= [];
const hidden	= [];
const ascertain	= {};
const id_alias	= 'ID';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, ascertain, id_alias);
	}
}

module.exports = new Collection();
