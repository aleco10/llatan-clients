var mysql = require('mysql');
//mysql://ba4dd071991338:676b23d2@us-cdbr-east-06.cleardb.net/heroku_05de5eb1ce10b8b?reconnect=true
var dbConfig = {
    connectionLimit : 10,
    host: 'us-cdbr-east-06.cleardb.net',
    database: 'heroku_05de5eb1ce10b8b',
    user: 'ba4dd071991338',
    password: '676b23d2'
}

let pool = mysql.createPool(dbConfig);

module.exports = pool;