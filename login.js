var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var bcrypt = require("bcrypt");
var flash = require("connect-flash");
var util = require("util");

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

app.use(bodyParser.json());

app.use(express.static("public"));

app.use(flash());

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

app.get('/home',async function(req, res){
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
            var monthindex = months.findIndex(month => month == req.query.currMonth);
            if(req.query.side == 0) monthindex-=1;
            else monthindex+=1;
            date.setMonth(monthindex);
        }

        if(req.query.currMonth != undefined)next();

        var month = months[date.getMonth()];
        req.session.month = date.getMonth() + 1;
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        var prevlastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        date.setDate(1);
        var getFirstDay = date.getDay() - 1; 
        var getLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay();

        const AsyncQuery = util.promisify(connection.query).bind(connection);



        const result = await AsyncQuery("SELECT COUNT (*) FROM tasks WHERE username = ?;",[req.session.username]);
        var numTasks = result[0]['COUNT (*)'];

        var tasks = [];
        console.log(req.session.username);

        const result2 = await AsyncQuery("SELECT taskName,taskDesc,taskDate FROM tasks WHERE username = ?;",[req.session.username]);
        for(var i in result2)
            {
                
                tasks.push([result2[i]['taskName'],result2[i]['taskDesc'],result2[i]['taskDate'].toLocaleDateString()]);
            }

        res.render(path.join(__dirname + '/home.ejs'),{
            date : date,
            month : month,
            lastDay : lastDay,
            firstDayIndex : getFirstDay,
            prevLastDay : prevlastDay,
            lastDayIndex : getLastDay,
            next : next,
            tasks : tasks,
            numTasks : numTasks
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

app.post('/addtask',function(req, res){
    var taskName = req.body.taskName;
    var description = req.body.taskDescription;
    // var month = parseInt(req.flash("month")) + 1;
    var year = req.body.year;
    var day = req.body.day;
    console.log(req.session.username);
    console.log(req.session.month);
    console.log(taskName);
    console.log(description);
    console.log(year);
    console.log(day);
    connection.query('INSERT INTO tasks (username,taskName,taskDesc,taskDate) VALUES (?,?,?,DATE(?))',[req.session.username,taskName,description,year+'-'+req.session.month+'-'+day],
    function(error,results){
        if(!error)
        {
            console.log("inserted "+ req.session.username + " " + taskName + " " + description + " " + year +'-'+req.session.month+'-'+day);
            res.redirect('back');
            console.log("ej");
        }
        else console.log(error);  
    });

});


app.listen(3000);