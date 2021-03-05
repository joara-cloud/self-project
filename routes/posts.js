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
        // 테이블 정보 : idx(auto), board_idx(int), f_name, f_originalname, f_type

        var data = {
          board_idx: boardInsertId,
          f_name: file.filename, // 중복되지 않게 저장해줌
          f_originalname: file.originalname,
          f_type: file.mimetype
        }

        var fileExec = conn.query('insert into board_file set ?', data, function(err, result) {
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
  console.log('fetch post 호출됨');

	var {subject, content} = req.body;

  db.getConnection(function(err, conn) {
    if(err) {
      console.log('getConnection 중 오류 : ' + err);
      return;
    }

    var exec = conn.query('select * from posts order by created DESC', function(err, rows) { // 게시물 패치
      conn.release();
      console.log('실행될 sql : ' + exec.sql);

      
      if(err) {
        console.log('Fetch posts sql 실행도중 오류 발생함.');
        console.dir(err);

        return;
      }

      // https://gist.github.com/livelikeabel/909d5dc35e96e3f0bed0cd28cddcdeaf (이중 query 사용 사례)
      for(var row in rows) {
        var data = {
          board_idx: rows[row].idx
        }
        conn.query('select * from board_file where ?',data , function(err, files) {
          if(err) {
            console.log('select files sql 실행도중 오류 발생함. sql은? ', conn.sql);
            console.dir(err);
    
            return;
          }
          console.log(files);
        })
      }



      // for(var i=0; i<rows.length; i++) {
      //   boardIdx = rows[i].idx;
      //   var fileExec = conn.query('select board_idx from board_file where board_idx = ' + boardIdx, function(err, fileRows) {
      //     if(err) {
      //       console.log('file sql 중 에러 : ' + err);
      //       return;
      //     }
      //     console.log('file rows : ');
      //     console.dir(fileRows);
      //   });
      //   console.log(fileExec.sql);
      // }
      
      res.status(200).send({
        msg: '2post 게시물을 불러왔습니다.',
        posts: rows,
      });
    })
  })
})


/****************************/

module.exports = router;