const Model     = require('./model');

const table     = 'tbl_usrs';
const fillable  = ['usr_email', 'usr_password', 'usr_display_name', 'usr_designation', 'usr_gender', 'usr_province', 'usr_regency', 'usr_district', 'usr_village', 'usr_year_born', 'usr_score', 'usr_contribution', 'last_logged_in', 'no_of_times_logged_in', 'usr_education', 'usr_institution', 'code_reset'];
const required  = ['usr_email', 'usr_password'];
const preserved	= [];
const hidden	= ['usr_password'];
const id_alias	= 'ID';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
