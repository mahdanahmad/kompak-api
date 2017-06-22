const Model     = require('./model');

const table     = 'tbl_essai_answers';
const fillable  = ['id_essai_question', 'usr_id', 'answer', 'submitted_date'];
const required  = ['id_essai_question', 'usr_id', 'answer'];
const preserved	= ['id_essai_question', 'usr_id', 'answer', 'submitted_date'];
const hidden	= [];
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
