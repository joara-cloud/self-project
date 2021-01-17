var mysql = require('mysql');

// Database 연결
var db = mysql.createPool({
  connectionLimit: 10,
  host: 'us-cdbr-east-02.cleardb.com',
  user: 'b911dcaae2b835',
  port: 3306,
  password: '7363aad2',
  database: 'heroku_e1bf3b94a251bc3',
  debug: false
});

module.exports = db; // 하나의 모듈만 export할 때