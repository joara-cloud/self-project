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
			console.log('[create memo] getConnection 중 에러 : ', err);
			return;
		}

		const data = {
			subject: subject,
			content: content,
			pos: pos
		}

		var exec = conn.query('insert into memo set ?', data, function(err, result) {
			conn.release();
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

	console.log('fetch');

	db.getConnection(function(err, conn) {
		if(err) {
			console.log('[fetch moemo] getConnection 중 에러 : ', err);
			return;
		}

		var excu = conn.query('select * from memo order by pos asc', function(err, rows) {
			conn.release();
			
			console.log('fetch memo SQL : ', excu.sql);

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
			console.log('[delete memo] getConnection 중 에러 : ', err);
			return;
		}

		const data = {
			idx: id
		}

		var exec = conn.query('delete from memo where ?',data, function(err, rows) {
			conn.release();
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

// Update memo
router.put('/update', function(req, res, next) {

	const {pos, idx} = req.body;
	console.log('pos : ', pos);

	db.getConnection(function(err, conn) {
		if(err) {
			console.log('[update memo] getConnection 중 에러 : ', err);
			return;
		}

		const data = {
			pos: pos,
			idx: idx
		}

		
		var exec = conn.query('update memo set pos=? where idx=?',[data.pos, data.idx], function(err, rows) {
			conn.release();
			if(err) {
				console.log('insert 중 에러 ', err);
				return;
			}

			console.log(exec.sql);

			res.status(200).send({
				msg: 'update memo',
				pos: data.pos
			})
		});
	})
})


module.exports = router;