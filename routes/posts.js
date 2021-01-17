var express = require('express');
var mysql = require('mysql');
const multer = require('multer');
var router = express.Router();
const imageSavePath = 'public/img/'; // 파일이 저장될 경로 지정


console.log('posts.js');

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
      callback(null, file.originalname);
    }
  });

  const upload = multer({
    storage
  })

// Create post
router.post('/create', upload.single('uploadImage'), function(req, res, next) {
  
  var {subject, content} = req.body;
  console.dir(req.file);

  pool.getConnection(function(err, conn) {
    if(err) {
      console.log('err : '+ err);
      return;
    }
  
    console.log('데이터베이스 연결 스레드 아이디 : '+conn.threadId);
    var data = {
      subject, 
      content
    }
    var exec = conn.query('insert into posts set ?', data, function(err, result) {
      conn.release();
      console.log('실행될 sql : ' + exec.sql);

      if(err) {
        console.log('sql 실행도중 오류 발생함.');
        console.dir(err);

        return;
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

    var exec = conn.query('select * from posts', function(err, result) {
      conn.release();
      console.log('실행될 sql : ' + exec.sql);

      if(err) {
        console.log('Fetch posts sql 실행도중 오류 발생함.');
        console.dir(err);

        return;
      }
      res.status(200).send({
        msg: 'post 게시물을 불러왔습니다.',
        posts: result
      });
    })
  })
})


/****************************/




module.exports = router;