const Model     = require('./model');

const table     = 'tbl_questions';
const fillable  = ['usr_id', 'question_category', 'question_text', 'response_1', 'response_2', 'response_3', 'response_4', 'correct_response', 'bonus_value', 'time_to_answer', 'question_enabled', 'no_of_times_correctly_answered', 'no_of_times_incorrectly_answered', 'no_of_times_presented_as_challenge', 'no_of_times_response_1', 'no_of_times_response_2', 'no_of_times_response_3', 'no_of_times_response_4', 'status', 'submitted_date', 'modified_date'];
const required  = ['usr_id', 'question_category', 'question_text', 'response_1', 'response_2', 'response_3', 'response_4', 'correct_response'];
const preserved	= ['usr_id', 'submitted_date'];
const hidden	= [];
const id_alias	= 'ID_question';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
