const MySQL	= require('mysql');

const state	= { db: null };

exports.connect = (host, user, password, database, callback) => {
	if (state.db) return callback();

	state.db	= MySQL.createConnection({ host, user, password, database });

	callback();
};

exports.close = (callback) => {
	if (state.db) {
		state.db.end((err) => {
			if (err) {  callback(err); }
			state.db = null;
		});
	}
};

exports.get		= () => (state.db);
