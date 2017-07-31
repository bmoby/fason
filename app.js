var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
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
var compression = require('compression');
// Get the module

// Init App
// new test
var app = express();

mongoose.connect(process.env.MONGO_URI);
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout:'layout',
  partialsDir: __dirname + '/views/utils/',
  handlebars: Handlebars,
  extname: '.hbs',
    helpers: {
      last: function(array){return array[array.length -1].msg;},
      subject: function(str){if (str.length > 50) return str.substring(0,50) + '...'; return str; },
      eachNewLine: function (str, options) {
      	var accum = '';
      	var data = Handlebars.createFrame(options, options.hash);
      	var arr = str.split(/\r?\n/);
        arr.map(function(str) {
      		if (str) accum += options.fn(str.trim(), {data: data});
      	});
        return accum;
      }
    }
  }));

app.set('view engine', '.hbs');

// compress responses
app.use(compression());
var oneYear = 1 * 365 * 24 * 60 * 60 * 1000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(device.capture());
app.timeout = 1000;

// Set Static Folder
app.use(express.static(path.join(__dirname, '/public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.get('/*', function (req, res, next) {
  if (req.url.indexOf("/images/") === 0 || req.url.indexOf("/stylesheets/") === 0) {
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
  }
  var reqType = req.headers["x-forwarded-proto"];
  reqType == 'https' ? next() : res.redirect("https://" + req.headers.host + req.url);
});

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

// Set Port
app.set('port', (process.env.PORT));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
