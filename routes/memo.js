const { response } = require('express');
var express = require('express');
const multer = require('multer');
const path = require('path');
var router = express.Router();


var db = require('../lib/db.js');


// Create memo
router.post('/create', function(req, res, next) {
	res.status(200).send({msg: 'create memo'});

	const {subject, content, pos} = req.body;

	db.getConnection(function(err, conn) {
		if(err) {
			console.log('getConnection 중 에러 : ', err);
			return;
		}

		const data = {
			subject: subject,
			content: content,
			pos: pos
		}

		var excu = conn.query('insert into memo set ?', data, function(err, result) {
			console.log(excu.sql);;
		});
	})
})

// Fetch memo
router.post('/fetch', function(req, res, next) {

	db.getConnection(function(err, conn) {
		if(err) {
			console.log('getConnection 중 에러 : ', err);
			return;
		}

		var excu = conn.query('select * from memo', function(err, rows) {
			console.log(rows);
			res.status(200).send({
				msg: 'fetch memo',
				rows: rows
			})
		});
	})
})


module.exports = router;