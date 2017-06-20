const Model     = require('./model');

const table     = 'tbl_badges';
const fillable  = ['badge_name', 'badge_text', 'score_min', 'score_max'];
const required  = ['badge_name'];
const preserved	= [];
const hidden	= [];
const ascertain	= {};
const id_alias	= 'ID_Badge';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, ascertain, id_alias);
	}
}

module.exports = new Collection();
