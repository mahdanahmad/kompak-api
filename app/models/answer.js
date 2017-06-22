const Model     = require('./model');

const table     = 'tbl_user_answer';
const fillable  = ['question_id', 'status_answer', 'answered_by', 'answered_date'];
const required  = ['question_id', 'status_answer', 'answered_by'];
const preserved	= ['question_id', 'status_answer', 'answered_by', 'answered_date'];
const hidden	= [];
const id_alias	= 'ID';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
