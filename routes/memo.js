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

		var exec = conn.query('insert into memo set ?', data, function(err, result) {
			if(err) {
				console.log('insert 중 에러 ', err);
				return;
			}
			console.log('insert 됨 ', exec.sql);
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
			res.status(200).send({
				msg: 'fetch memo',
				rows: rows
			})
		});
	})
})

// Delete memo
router.delete('/delete', function(req, res, next) {

	const {id} = req.body;
	console.log(id);

	db.getConnection(function(err, conn) {
		if(err) {
			console.log('getConnection 중 에러 : ', err);
			return;
		}

		const data = {
			idx: id
		}

		var exec = conn.query('delete from memo where ?',data, function(err, rows) {
			if(err) {
				console.log('insert 중 에러 ', err);
				return;
			}

			console.log(exec.sql);

			res.status(200).send({
				msg: 'delete memo'
			})
		});
	})
})


module.exports = router;