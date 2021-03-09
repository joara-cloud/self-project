var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var mysql = require('mysql');
const multer = require('multer');
// const imageSavePath = './public/img/'; // 파일이 저장될 경로 지정
var history = require('connect-history-api-fallback');
var url = require('url');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var memoRouter = require('./routes/memo');

var app = express();
var router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// port setup
app.set('port', process.env.PORT || 3000);

app.use(history()); 
app.use(logger('dev')); 
app.use(express.json()); // body-parser (express.js도 빌트인 body parser를 넣었다는 점)
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('upload'));
app.use(express.static('public'));

// router.route('/posts/list').get(function(req, res) {
//   console.log('/posts/list 호출됨.');

//   var paramAge = req.url;
  
//   console.log('요청 파라미터 : ', paramAge);

//   res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
//   res.send().status(200);
//   res.end();
// });

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/memo', memoRouter);




/****************************/


// 라우터 객체 등록
// app.use('/', router);

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