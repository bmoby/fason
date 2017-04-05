
// IMPORTING ALL NEEDED PACKAGES
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var User = require('../models/user');
var moment = require('moment');
var bcrypt = require('bcryptjs');
var Promise = require('promise');
var Conversation = require('../models/conversation');
var Stylebox = require('../models/stylebox');
var Pusher = require('pusher');
var path = require('path');
var fs = require('fs');

// Params setting for pusher -> REAL TIME NOTIFICATIONS SYSTEM
var pusher = new Pusher({
  appId: '283453',
  key: '095ff3028ab7bceb6073',
  secret: '25077850beef8ae1d148',
  encrypted: true
});
// Setting the body parser for json
router.use(bodyParser.json());


router.get('/checkevals', function(req, res){
  if(req.user){
    var connectedUser = req.user;
    if(connectedUser.evals){
      var validevals = [];
      connectedUser.evals.forEach(function(eval, index, object){
        if(moment(eval.startDate) < moment() && moment(eval.endDate) > moment() && eval.participated == false){
          var participated = false;
          validevals.push(eval);
        }

        if(index+1  == object.length){
          res.send({"evals": validevals.length})
        }
      })
    } else {
      res.end();
    }
  } else {
    res.end();
  }
});




// Exporting the router
module.exports = router;
