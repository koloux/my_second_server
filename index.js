const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host     : 'localhost',
	port		 : 8889,
  user     : 'root',
  password : 'root',
});

function initMySQL() {
  const id = 'id int UNIQUE auto_increment PRIMARY KEY,';
  const media_uuid = 'media_uuid VARCHAR(255) NOT NULL,';
  const published_at = 'published_at DATETIME NOT NULL';
	connection.query('CREATE DATABASE IF NOT EXISTS db');
  connection.query('USE db');
  connection.query('CREATE TABLE IF NOT EXISTS stories (' + id + media_uuid + published_at + ')');
}

function IsNumber(value) {
  return isNaN(value);
}

app.get('/stories', function (req, res) {
  connection.query('SELECT * FROM stories ORDER BY id', function(error, results, fields) {
    if (error) {
      throw error;
    }
    res.send(results);
  });
})

app.get('/stories/:id', function(req, res) {
  let e = new Error();
  e.status = 400;
  e.msg = 'Invalid Id';
  if (IsNumber(req.params.id)) {
    res.status(e.status).send(e);
  }
  else {
    connection.query('SELECT * FROM stories WHERE id = ' + req.params.id, function(error, results, fields) {
      if (error) {
        throw error;
      }
      if (!results[0]) {
        res.status(e.status).send(e);
      } else {
        res.send(results);
      }
    });
  }
})

app.post('/stories', function(req, res) {
  let e = new Error();
  e.status = 400;
  e.msg = 'Invalid ';
  if (req.body.media_uuid && req.body.published_at)
  {
    const media_uuid = Array.isArray(req.body.media_uuid) ? req.body.media_uuid[0] : req.body.media_uuid;
    const published_at = Array.isArray(req.body.published_at) ? req.body.published_at[0] : req.body.published_at;
    let ret = new Object();
    ret.id = -1,
    ret.media_uuid = media_uuid;
    ret.published_at = published_at;
    connection.query('INSERT INTO stories (media_uuid, published_at) VALUES (\''+ media_uuid + '\',\'' + published_at + '\')', function (error, results, fields) {
      console.log(results.insertId);
      ret.id = results.insertId;
      res.send(ret);
    });
  } else {
    e.msg = e.msg + 'media_uuid and published_at';
    res.status(e.status).send(e);
  }
})

app.listen(port, function() {
	console.log('Server is listening on : ' + port);
  connection.connect();
  initMySQL();
})
