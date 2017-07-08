const Model     = require('./model');

const table     = 'tbl_admins';
const fillable  = ['name', 'username', 'password', 'email', 'role'];
const required  = ['name', 'username', 'password', 'email', 'role'];
const preserved	= [];
const hidden	= ['password'];
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
