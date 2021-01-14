var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
const multer = require('multer');
const imageSavePath = 'public/images/'; // 파일이 저장될 경로 지정

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// var postsRouter = require('./routes/posts');

var app = express();
var router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// port setup
app.set('port', process.env.PORT || 3000);

app.use(logger('dev')); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/posts', postsRouter);




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
router.route('/posts/create').post(function(req, res, next) {
  var {subject, content} = req.body;


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
router.route('/posts').get(function(req, res, next) {
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

// 라우터 객체 등록
app.use('/', router);

/****************************/




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});