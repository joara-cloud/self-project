var express = require('express');
const multer = require('multer');
const path = require('path');
var router = express.Router();
const imageSavePath = 'upload/'; // 파일이 저장될 경로 지정

/****************************/

var db = require('../lib/db.js');

const storage = multer.diskStorage({
  destination(req, file, callback) { 
    callback(null, imageSavePath);
  },
  filename(req, file, callback) { // 파일명 설정
    var temp = file.originalname.split('.');
    var extend = file.mimetype.split('/')[1];
    var renamed = temp[0] + new Date().valueOf() + '.' + extend;
    callback(null, renamed);
  }
});

const upload = multer({
  storage
})

// Create post
router.post('/create', upload.single('uploadImage'), function(req, res, next) {
  
  var {subject, content} = req.body;
  var {file} = req;

  db.getConnection(function(err, conn) {
    if(err) {
      console.log('err : '+ err);
      return;
    }
  
    console.log('데이터베이스 연결 스레드 아이디 : '+conn.threadId);
    var data = {subject, content, file}

    var exec = conn.query('insert into posts set ?', data, function(err, result) {
      conn.release();
      console.log('실행될 sql : ' + exec.sql);
      console.log('board insert ID : ' + result.insertId);

      if(err) {
        console.log('sql 실행도중 오류 발생함.');
        console.dir(err);

        return;
      }

      var boardInsertId = result.insertId;

      if(file) { // 첨부파일이 있으면
        console.log('첨부파일 있음');
        console.log(file);

        var data = {
          post_id: boardInsertId,
          f_name: file.filename, // 중복되지 않게 저장해줌
          f_originalname: file.originalname,
          f_type: file.mimetype
        }

        var fileExec = conn.query('insert into posts_file set ?', data, function(err, result) {
          conn.release();
          console.log('첨부파일 실행 sql : ' +  fileExec.sql);

          if(err) {
            console.log('첨부파일 query진행중 오류');
            
            return;
          }

          console.log('첨부파일 sql 실행됨');
        })
      }else {
        console.log('no file');
      }

      res.status(200).send({msg: '성공적으로 등록되었습니다.'});
    })
  })  
})

// Fetch posts
router.get('/', function(req, res, next) {
  console.log('fetch posts 호출됨');

  db.getConnection(function(err, conn) {
    if(err) {
      console.log('getConnection 중 오류 : ' + err);
      return;
    }

    // var exec = conn.query('select * from posts order by created DESC', function(err, rows) { // 게시물 패치
    var exec = conn.query('select p.*, b.post_id, b.f_name from posts p left join posts_file b on p.pid = b.post_id order by created DESC', function(err, rows) { // 게시물 패치 (eddie)
      conn.release();
      console.log('실행될 sql : ' + exec.sql);
      
      if(err) {
        console.log('Fetch posts sql 실행도중 오류 발생함.');
        console.dir(err);

        return;
      }
      
      res.status(200).send({
        msg: 'post 게시물을 불러왔습니다.',
        posts: rows,
      });
    })
  })
})

// Fetch post (1개)
router.get('/:id', function(req, res, next) {
  console.log('fetch post 호출됨');

  const id = req.params.id;
  console.log('id :::::::::::::::::::::::::::', id);

  db.getConnection(function(err, conn) {
    if(err) {
      console.log('getConnection 중 오류 : ' + err);
      return;
    }

    var exec = conn.query('select p.*, f.f_name from posts p LEFT JOIN posts_file f ON f.post_id = p.pid where p.pid = ?',id, function(err, rows) { // 게시물 패치
      conn.release();
      console.log('실행될 sql : ' + exec.sql);
      
      if(err) {
        console.log('Fetch posts sql 실행도중 오류 발생함.');
        console.dir(err);

        return;
      }
      
      res.status(200).send({
        msg: 'post 게시물을 불러왔습니다.',
        posts: rows,
      });
    })
  })
})



/****************************/

module.exports = router;