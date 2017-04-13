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
var compression = require('compression');
// Get the module
var expressGoogleAnalytics = require('express-google-analytics');

// Insert your Google Analytics Id, Shoule be something like 'UA-12345678-9'
var analytics = expressGoogleAnalytics(process.env.ANALYTICS);

// Init App
var app = express();

mongoose.connect(process.env.MONGO_URI /*|| 'mongodb://localhost:3001/bianor'*/);
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

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

// compress responses
app.use(compression());
var oneYear = 1 * 365 * 24 * 60 * 60 * 1000;
app.use(bodyParser.json());
app.use(analytics);
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

app.get('/*', function (req, res, next) {

  if (req.url.indexOf("/images/") === 0 || req.url.indexOf("/stylesheets/") === 0 || req.url.indexOf("/styleboxphotosbianor/") === 0) {
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
  }
  next();
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
app.set('port', (process.env.PORT/* || 3000*/));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
