var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const { exists } = require('fs');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'Ivanbabyuk1+',
	database : 'seculum'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.render('index.ejs')
});

app.get('/registar', function(request, response){
	response.render('register.ejs')
})

app.post('/authregister', function(request, response){
	var namereg = request.body.usernamereg;
	var emailreg = request.body.emailreg;
	var passwordreg = request.body.passwordreg;
	if(namereg && emailreg && passwordreg){
		connection.query('SELECT * FROM accounts WHERE name = ?', [namereg], function(error, results, fields) {
			if (results.length > 0) {
                response.send('Account already exists with that username!');
                response.end();
            } else if (!/\S+@\S+\.\S+/.test(emailreg)) {
                // Make sure email is valid
                response.send('Invalid email address!');
                response.end();
            } else if (!/[A-Za-z0-9]+/.test(namereg)) {
                // Username validation, must be numbers and characters
                response.send('Username must contain only characters and numbers!');
                response.end();
			}
		})
	}

	connection.query('INSERT INTO accounts (username, email, password) VALUES (?, ?, ?);', [namereg, emailreg, passwordreg], function(error, results, fields) {
		if (error){
			return console.log(error)
		}
		response.redirect('/login')
		response.end()
	})
});

app.get('/login', function(request, response){
	response.render('login.ejs')
})

app.post('/authlogin', function(request, response) {
	var name = request.body.username;
	var password = request.body.password;
	if (name && password) {
		connection.query('SELECT * FROM accounts WHERE name = ? AND password = ?', [name, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.name = name;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.render('home.ejs')
	} else {
		response.redirect('/login')
	}
	response.end();
});

app.listen(3000);