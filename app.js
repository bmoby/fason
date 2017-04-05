var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var mongorelation = require('mongo-relation');
var formidable = require('formidable');
var fs = require('fs');
var device = require('express-device');
// Init App
var app = express();

mongoose.connect("mongodb://heroku_c6gk9lsk:q11bs0ufch1ni7idbvq9lsf82j@ds145220.mlab.com:45220/heroku_c6gk9lsk");
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var notifications = require('./routes/notif');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout:'layout',
  partialsDir: __dirname + '/views/utils/',
  extname: '.hbs',
    helpers: {
      last: function(array){return array[array.length -1].msg;},
      subject: function(str){if (str.length > 50) return str.substring(0,50) + '...'; return str; }
    }
  })
);

app.set('view engine', '.hbs');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(device.capture());

// Set Static Folder
app.use(express.static(path.join(__dirname, '/public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use('/', routes);
app.use('/users', users);
app.use('/notifs', notif);

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
