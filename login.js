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


        

        var date = new Date();
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
        function next()
        {
            console.log("SIEMA KLIKLEM NEXT");
            var monthindex = months.findIndex(month => month == req.query.currMonth);
            if(req.query.side == 0) monthindex-=1;
            else monthindex+=1;
            date.setMonth(monthindex);
        }

        if(req.query.currMonth != undefined)next();


        var month = months[date.getMonth()];
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        var prevlastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        date.setDate(1);
        var getFirstDay = date.getDay() - 1; 
        var getLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay();

        



        res.render(path.join(__dirname + '/home.ejs'),{
            date : date,
            month : month,
            lastDay : lastDay,
            firstDayIndex : getFirstDay,
            prevLastDay : prevlastDay,
            lastDayIndex : getLastDay,
            next : next
          });
        
    }else{
        res.send("LOGIN TO VIEW THIS PAGE");
    }
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