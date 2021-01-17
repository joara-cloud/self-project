var express = require('express');
var mysql = require('mysql');
const multer = require('multer');
const path = require('path');
var router = express.Router();
const imageSavePath = 'upload/'; // 파일이 저장될 경로 지정

/****************************/

// Database 연결
var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'us-cdbr-east-02.cleardb.com',
  user: 'b911dcaae2b835',
  port: 3306,
  password: '7363aad2',
  database: 'heroku_e1bf3b94a251bc3',
  debug: false
});

const storage = multer.diskStorage({
  destination(req, file, callback) { 
    callback(null, imageSavePath);
  },
  filename(req, file, callback) {
    // callback(null, file.originalname);

    var temp = file.originalname.split('.');
    var extend = temp.pop();
    var renamed = temp + new Date().valueOf() + '.' + extend;
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

  pool.getConnection(function(err, conn) {
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
        // 테이블 정보 : idx(auto), board_idx(int), f_name, f_originalname, f_type

        var data = {
          board_idx: boardInsertId,
          f_name: file.filename,
          f_originalname: file.originalname,
          f_type: file.mimetype
        }

        var fileExec = conn.query('insert into board_file set ?', data, function(err, result) {
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
  console.log('fetch post 호출됨');

	var {subject, content} = req.body;

  pool.getConnection(function(err, conn) {
    if(err) {
      console.log('getConnection 중 오류 : ' + err);
      return;
    }

    var exec = conn.query('select * from posts', function(err, rows) {
      conn.release();
      console.log('실행될 sql : ' + exec.sql);

      if(err) {
        console.log('Fetch posts sql 실행도중 오류 발생함.');
        console.dir(err);

        return;
      }

      for(var i=0; i<rows.length; i++) {
        boardIdx = rows[i].idx;
        var fileExec = conn.query('select board_idx from board_file where board_idx = ' + boardIdx, function(err, rows) {
          console.log('file rows'+rows);
        });
        console.log(fileExec.sql);

      }
      
      res.status(200).send({
        msg: 'post 게시물을 불러왔습니다.',
        posts: rows
      });
    })
  })
})


/****************************/

module.exports = router;