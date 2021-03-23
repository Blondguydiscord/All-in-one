var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const { exists } = require('fs');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
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
	response.redirect('/login')
});

app.get('/registar', function(request, response){
	response.render('register.ejs')
})

app.post('/authregister', function(request, response){
	var usernamereg = request.body.usernamereg;
	var emailreg = request.body.emailreg;
	var passwordreg = request.body.passwordreg;
	if(usernamereg && emailreg && passwordreg){
		connection.query('SELECT * FROM accounts WHERE username = ?', [usernamereg], function(error, results, fields) {
			if (results.length > 0) {
                response.send('Account already exists with that username!');
                response.end();
            } else if (!/\S+@\S+\.\S+/.test(emailreg)) {
                // Make sure email is valid
                response.send('Invalid email address!');
                response.end();
            } else if (!/[A-Za-z0-9]+/.test(usernamereg)) {
                // Username validation, must be numbers and characters
                response.send('Username must contain only characters and numbers!');
                response.end();
			}
		})
	}

	connection.query('INSERT INTO accounts (username, email, password) VALUES (?, ?, ?);', [usernamereg, emailreg, passwordreg], function(error, results, fields) {
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
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
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
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(3000);