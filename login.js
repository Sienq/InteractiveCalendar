var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var bcrypt = require("bcrypt")


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'skorpion67',
    database : 'Calendar'
});
var app = express();

app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));

app.use(bodyParser.urlencoded({extended : true}));

app.use(bodyParser.json())

app.use(express.static("public"))

app.get('/', function (req, res)
{
    res.sendFile(path.join(__dirname + '/login.html'));
});


app.post('/auth', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
 
    if(username && password){
        connection.query('SELECT * FROM users WHERE username = ? AND pass = ?',[username,password], function(error,results){
            if(results.length > 0){
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/home');
            }else{
                res.send("INVALID DATA");
            }
            res.end();
        });
    }else{
        res.send("ENTER USERNAME AND PASSWORD");
        res.end();
    }
});

app.get('/home',function(req, res){
    if(req.session.loggedin){
        res.sendFile(path.join(__dirname + '/home.html'));
    }else{
        res.send("LOGIN TO VIEW THIS PAGE");
    }
    // res.end();
});

app.post('/register',function(req, res){
    res.sendFile(path.join(__dirname + '/register.html'));
});


app.listen(3000)