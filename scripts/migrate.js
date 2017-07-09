require('dotenv').config();

const _		= require('lodash');
const hash 	= require('crypto-js/sha256');
const async	= require('async');
const MySQL	= require('mysql');

const nme_logs		= 'tbl_logs';
const nme_admins	= 'tbl_admins';

const def_admin		= {
	name		: 'Admin Gapura Desa',
	username	: 'gapuradesa',
	password	: hash(hash('ketikaja').toString()).toString(),
	email		: 'admin@gapura-desa.id',
	role		: JSON.stringify([]),
}

let db		= MySQL.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
});

async.waterfall([
	(flowCallback) => {
		db.query('DROP TABLE IF EXISTS `' + nme_logs + '`, `' + nme_admins + '`', (err, result) => {
			if (err) { return flowCallback(err); }

			flowCallback();
		});
	},
	(flowCallback) => {
		db.query('CREATE TABLE ' + nme_admins + ' (' +
			'id INT AUTO_INCREMENT primary key NOT NULL,' +
			'name varchar(255) NOT NULL,' +
			'username varchar(255) NOT NULL UNIQUE,' +
			'password varchar(255) NOT NULL,' +
			'email varchar(255) NOT NULL,' +
			'role TEXT NOT NULL' +
		')', (err, result) => {
			if (err) { return flowCallback(err); }

			flowCallback();
		});
	},
	(flowCallback) => {
		db.query('CREATE TABLE ' + nme_logs + ' (' +
			'id INT AUTO_INCREMENT primary key NOT NULL,' +
			'defendant INT NOT NULL,' +
			'state varchar(255),' +
			'affected_table varchar(255),' +
			'affected_id INT,' +
			'prev_value LONGTEXT,' +
			'additional_info LONGTEXT,' +
			'recording_date DATETIME,' +
			'FOREIGN KEY (defendant) REFERENCES ' + nme_admins + '(id) ON DELETE NO ACTION' +
		')', (err, result) => {
			if (err) { return flowCallback(err); }

			flowCallback();
		});
	},
	(flowCallback) => {
		db.query('INSERT INTO ' + nme_admins + ' (' + _.keys(def_admin).join(', ') + ') VALUES (' + _.map(def_admin, (o) => ("'" + o + "'")).join(', ') + ')', (err, result) => {
			if (err) { return flowCallback(err); }

			flowCallback();
		});
	}
], (err, result) => {
	if (err) throw err;
	db.end();
});
