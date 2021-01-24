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
app.set('view engine','ejs')


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
    res.render(path.join(__dirname + '/login.ejs'));
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
        function date_set()
        {
            const date = new Date();
            const months = 
            [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ];

            console.log(date);
            return months[date.getMonth()];
        }

        res.render(path.join(__dirname + '/home.ejs'),{month : date_set()});
        
    }else{
        res.send("LOGIN TO VIEW THIS PAGE");
    }
    // res.end();
});

app.get('/register',function(req, res){
    res.render(path.join(__dirname + '/register.ejs'));
});

app.post('/register',function(req, res){
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
        connection.query('INSERT INTO users (username,pass,email) VALUES (?,?,?)',[username,password,email],function(error,results)
        {
            if(!error)
            {
                console.log("inserted "+ email + " " + username + " " + password);
                res.redirect("/")
            }

        });
});


app.listen(3000)    