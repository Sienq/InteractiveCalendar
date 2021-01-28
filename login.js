var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var bcrypt = require("bcrypt");
var flash = require("connect-flash");
var util = require("util");


const ROUNDS = 10;


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

const AsyncQuery = util.promisify(connection.query).bind(connection);

app.post('/auth', async function(req, res) {
    var username = req.body.username;
    var password = req.body.password;


 
    if(username && password)
    {
        connection.query('SELECT * FROM users WHERE username = ?',[username], function(error,results){
            
            bcrypt.compare(password,results[0]['pass']).then(function(result){
                if(result)
                {
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/home');  
                }
                else
                {
                  res.send("INVALID DATA");  
                }
            });
        });
    }
    else
    {
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

app.post('/register',async function(req, res){
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    const users = await AsyncQuery("SELECT EXISTS(SELECT username FROM users WHERE username = ?);",[username]);
    if(users[0]['EXISTS(SELECT username FROM users WHERE username = \''+username+'\')'] == 0)
    {
        await bcrypt.hash(password, ROUNDS).then(function(hash) {
            password = hash;
        });
            connection.query('INSERT INTO users (username,pass,email) VALUES (?,?,?)',[username,password,email],function(error,results)
            {
                if(!error)
                {
                    console.log("inserted "+ email + " " + username + " " + password);
                    res.redirect("/")
                }
                else console.log(error);

            });
    }
    else
    {
        res.send("USERNAME ALREADY TAKEN");
    }

});

app.post('/addtask',function(req, res){
    var taskName = req.body.taskName;
    var description = req.body.taskDescription;
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


app.get('/newPass',function(req,res){
    res.render(path.join(__dirname + '/password.ejs'));
});

app.post('/newPass',async function(req, res){
    var username = req.body.username;
    var oldP = req.body.oldPassword;
    var newP = req.body.newPassword;

    const result = await AsyncQuery("SELECT pass FROM users WHERE username = ?;",[username]);
    bcrypt.compare(oldP,result[0]['pass']).then(async function(result){
        if(result)
        {
            await bcrypt.hash(newP, ROUNDS).then(async function(hash) {
                newP = hash;
            });
            console.log(newP);
            const result2 = await AsyncQuery("UPDATE users SET pass = ? WHERE username = ?;",[newP,username]);
            console.log("chyba poszlo");
            res.redirect('/');
        }
        else
        {
            res.send("WRONG OLD PASSWORD");
            res.end();
        }
    });
    
});

app.get('/delete',function(req,res){
    res.render(path.join(__dirname + '/delete.ejs'));
});

app.post('/delete',async function(req,res)
{
    var username = req.body.username;
    var password = req.body.password;
    const result = await AsyncQuery("SELECT pass FROM users WHERE username = ?;",[username]);
    bcrypt.compare(password,result[0]['pass']).then(async function(result2){
        if(result2)
        {
           const deleteUser = await AsyncQuery("DELETE FROM users WHERE username = ?;",[username]);
           const deleteTasks = await AsyncQuery("DELETE FROM tasks WHERE username = ?;",[username]);
           console.log("bangla");
           res.redirect('/');
        }
        else
        {
            res.send("WRONG DATA");
            res.end();
        }
    });
});




app.listen(3000);