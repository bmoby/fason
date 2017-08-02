var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var User = require('../models/user');
var nodemailer = require('nodemailer');
var uuid = require('node-uuid');
var moment = require('moment');
var bcrypt = require('bcryptjs');
var Promise = require('promise');
var Conversation = require('../models/conversation');
var Stylebox = require('../models/stylebox');
var twilio = require('twilio');
var Pusher = require('pusher');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var AWS = require('aws-sdk');
var client = new twilio.RestClient((process.env.TWILLIO_SECRET),( process.env.TWILLIO_KEY));
// Params setting for pusher -> REAL TIME NOTIFICATIONS SYSTEM
var pusher = new Pusher({
  appId: (process.env.PUSHER_ID),
  key: (process.env.PUSHER_KEY),
  secret: (process.env.PUSHER_SECRET),
  encrypted: true
});

function randomIntFromInterval(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}


var transporter = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "fason.contact@gmail.com",
        pass: (process.env.MAIL_PASS || "Stylebox19871989-")
    }
});
router.use(bodyParser.json());
var rand, link, host;

AWS.config = {
  accessKeyId: (process.env.AWS_KEY),
  secretAccessKey: (process.env.AWS_SECRET)
}
var s3 = new AWS.S3();

var uploadMulter = multer({dest: 'public/img'})

router.post('/setavatarStyle', uploadMulter.single('displayImage'), function(req, res){
  if(req.user){
    var fileName = {};
    var file = req.file;
    var stream = fs.createReadStream(file.path)
    var imageType = file.mimetype.split('/').pop()
    fileName = file.filename+'.'+imageType;
    params = {
      Bucket: 'styleboxphotosfason',
      ACL: 'public-read',
      Key: fileName,
      Body: stream
    };

    s3.putObject(params, function(err, data){
      if (err){
        console.log(err)
      }else{
        fs.unlink(req.file.path, function(err){
          if (err) console.error(err)
        });
      }
    });

    var user = req.user;
    user.avatar = "https://s3.amazonaws.com/styleboxphotosfason/"+fileName;
    user.save();
    res.end();
  } else {
    res.redirect('https://fason.co');
  }
})



router.get('/updateprofil', function(req, res){
  if(req.user){
    var userFirstName = req.user.firstName;
    var userLastName = req.user.lastName;
    var userEmail = req.user.email;
    var userPhone = req.user.phone;
    var userAvatar = req.user.avatar;
    var userCity = req.user.city;
    res.render('profile', {"userAvatar": userAvatar, "userFirstName":userFirstName, "userLastName":userLastName, "userCity":userCity, "userEmail":userEmail, "userPhone":userPhone, "user":req.user});
  } else {
    res.redirect("http://fason.co/")
  }
});

router.post('/updateprofilform', uploadMulter.single('displayImage'), function(req, res){
  if(req.user){
    var userFirstName = req.body.userFirstName;
    var userLastName = req.body.userLastName;
    var userEmail = req.body.userEmail;
    var userPhone = req.body.userPhone;
    var userPassword = req.body.userPassword;
    var user = req.user;
    console.log("VARS", userFirstName, userLastName, userEmail, userPhone, userPassword);
    if(userFirstName !== user.firstName){
      user.firstName = userFirstName;
      user.save();
    }

    if(userPassword){
      user.password = bcrypt.hashSync(userPassword);
      user.save();
    }

    if(userLastName !== user.lastName){
      user.lastName = userLastName;
      user.save();
    }

    if(userEmail !== user.email){
      user.email = userEmail;
      user.varified = false;
      rand =  bcrypt.hashSync(uuid.v1());
      user.verifyEmailString = rand;
      link = "http://"+req.get('host')+"/users/verify?id="+rand;
      host = "http://"+req.get('host');
      var mailOptions = {
          from: '"Fason service client" <fason.contact@gmail.com>',
          to: userEmail,
          subject : "Confirmation de votre e-mail sur Fason",
          html : "Bonjour,<br> Veuillez confirmer votre e-mail afin de valider votre compte sur FASON.<br><a href="+link+">Appuyez ici pour confirmer</a>"
      };
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              return console.log(error);
          }
      });
      user.save();
    }

    if(userPhone !== req.user.phone){
      if (userPhone.charAt(0) == 0){
        userPhone = userPhone.substring(1);
        userPhone = "+33"+phone;
      }

      var phoneCode = randomIntFromInterval(10000, 100000);
      user.phone = userPhone;
      user.phoneVerification = phoneCode;
      user.phoneIsVerified = false;
      user.save();
    }

    if(req.file){
      var actualava = req.user.avatar;
      var n = actualava.lastIndexOf('/');
      var avakey = actualava.substring(n + 1);
      s3.deleteObject({
        Bucket: 'styleboxphotosfason',
        Key: avakey

      },function (err,data){if(err){console.log(err)}})
      var fileName = {};
      var file = req.file;
      var stream = fs.createReadStream(file.path)
      var imageType = file.mimetype.split('/').pop()
      fileName = file.filename+'.'+imageType;
      params = {
        Bucket: 'styleboxphotosfason',
        ACL: 'public-read',
        Key: fileName,
        Body: stream
      };

      s3.putObject(params, function(err, data){
        if (err){
          console.log(err)
        }else{
          fs.unlink(req.file.path, function(err){
            if (err) console.error(err)
          });
        }

      });

      setTimeout(function(){
        user.avatar = "https://s3.amazonaws.com/styleboxphotosfason/"+fileName
        user.save();
      },200)
    }
  }

  setTimeout(function(){
    res.redirect("https://www.fason.co");
  }, 1000);

})

router.post('/updateprofil', function(req, res){

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  if(req.user){
      var userFirstName = req.body.userFirstName;
      var userLastName = req.body.userLastName;
      var userEmail = req.body.userEmail;
      var userPhone = req.body.userPhone;
      var userPassword = req.body.userPassword;
      var user = req.user;
      var errors = [];

      // Body-Validations with express validators
      if(!userFirstName){
        var err = {param:'userFirstName', msg: 'Veuillez saisir votre nom.', value: "yes"}
        errors.push(err);
      }
      if(!userLastName){
        var err = {param:'userLastName', msg: 'Veuillez saisir votre prénom.', value: "yes"}
        errors.push(err);
      }
      if(!userEmail){
        var err = {param:'userEmail', msg: 'Veuillez saisir votre e-mail.', value: "yes"}
        errors.push(err);
      }
      if(!userPhone){
        var err = {param:'userPhone', msg: 'Veuillez saisir votre numéro de potable.', value: "yes"}
        errors.push(err);
      }

      if(userEmail != ""){
        if(!validateEmail(userEmail)){
          var err = {param:'userEmail', msg: "E-mail n'est pas valide.", value: "yes"}
          errors.push(err);
        }
      }

      if(userPassword){
        if(userPassword.length < 6 && userPassword.length > 20){
          var err = {param:'userPassword', msg: "Le mot de passe doit être compris entre 6 et 20 caractères.", value: "yes"}
          errors.push(err);
        }
      }


      setTimeout(function(){
        if(errors.length){
          console.log(errors);
          res.send({"errors":errors});
        } else {
          res.send({"ok":true});
        }
      }, 500);
  } else {
    res.redirect("http://fason.co/")
  }
});

router.post('/register', function(req, res){

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var email = req.body.email;
	var password = req.body.password;
  var city = "Paris, France";
	var terms = req.body.conditions;
  var client = req.body.client;
  var stylist = req.body.stylist;
  var phone = req.body.phone;
  var userType = req.body.userType;
  var errors = [];
  if (phone != null){
    if (phone.charAt(0) == 0){
      phone = phone.substring(1);
      phone = "+33"+phone;
    }
  }

	// Body-Validations with express validators
  if(!firstName){
    var err = {param:'firstName', msg: 'Veuillez saisir votre nom.', value: "yes"}
    errors.push(err);
  }
  if(!lastName){
    var err = {param:'lastName', msg: 'Veuillez saisir votre prénom.', value: "yes"}
    errors.push(err);
  }
  if(!email){
    var err = {param:'email', msg: 'Veuillez saisir votre e-mail.', value: "yes"}
    errors.push(err);
  }
  if(!phone){
    var err = {param:'phone', msg: 'Veuillez saisir votre numéro de potable.', value: "yes"}
    errors.push(err);
  }
  if(client == "off" && stylist == "off"){
    var err = {param:'userType', msg: "Précisez quel type d'utilisateur êtes-vous.", value: "yes"}
    errors.push(err);
  }

  if(email != ""){
    if(!validateEmail(email)){
      var err = {param:'email', msg: "E-mail n'est pas valide.", value: "yes"}
      errors.push(err);
    }
  }
  if(!password){
    var err = {param:'password', msg: "Veuillez saisir le mot de passe.", value: "yes"}
    errors.push(err);
  }

  if(password){
    if(password.length < 6 && password.length > 20){
      var err = {param:'password', msg: "Le mot de passe doit être compris entre 6 et 20 caractères.", value: "yes"}
      errors.push(err);
    }
  }

  if(terms == "off"){
    var err = {param:'conditions', msg: "Veuillez accepter les conditions générales d'utilisation."}
    errors.push(err);
  }

  rand =  bcrypt.hashSync(uuid.v1());

  var promise  = new Promise(function(resolve, reject){
    User.getUserByEmail(email, function(err, user){
      if (err){
        console.log(err);
      } else if (user){
        User.getUserByPhone(phone, function(err, user2){
          if(err){
            console.log(err)
          } else if (user2){
            resolve({email:'yes', phone:'yes'});
          } else {
            resolve({email:'yes', phone:'no'});
          }
        })
      } else {
        User.getUserByPhone(phone, function(err, user2){
          if(err){
            console.log(err)
          } else if (user2){
            resolve({email:'no', phone:'yes'});
          } else {
            resolve({email:'no', phone:'no'});
          }
        })
      }
    });
  });

  promise.then(function(result){
    if (result.email == 'yes' && errors) {
      errors.push({param:'userexists', msg: 'Un membre avec cet e-mail existe déjà. Si vous vaez oublié votre mot de passe, veuillez demander le nouveau mot de passe lors de votre connexion.', value: "yes"});
    } else if (result.email == 'yes' && errors == null){
      errors.push({param:'userexists', msg: 'Un membre avec cet e-mail existe déjà. Si vous vaez oublié votre mot de passe, veuillez demander le nouveau mot de passe lors de votre connexion.', value: "yes"});
    }
    if (result.phone == 'yes' && errors) {
      errors.push({param:'userexists2', msg: 'Un membre avec ce numéro de portable existe déjà.', value: "yes"});
    } else if (result.phone == 'yes' && errors == null){
      errors.push({param:'userexists2', msg: 'Un membre avec ce numéro de portable existe déjà.', value: "yes"});
    }
    return errors
  }).then(function(result){
    if(result.length !== 0){
      res.send({errors: result});
  	} else {
      res.send({"ok":true});
  	}
  });
});

router.post('/registerform', uploadMulter.single('displayImage'), function(req, res){

  var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var email = req.body.email;
	var password = req.body.password;
  var city = "Paris, France";
  var phone = req.body.phone;
  var client = req.body.simpleuser;
  var ava = "https://fason.herokuapp.com/images/noavatar.png";

  function checkifava(callbackk){
    if(req.file){
      console.log("THERE IS A FILE")
      var file = req.file;
      var stream = fs.createReadStream(file.path)
      var imageType = file.mimetype.split('/').pop()
      var fileName = file.filename+'.'+imageType;
      ava = "https://s3.amazonaws.com/styleboxphotosfason/"+file.filename+'.'+imageType;
      console.log(ava, "AVA DEFINED")
      params = {
        Bucket: 'styleboxphotosfason',
        ACL: 'public-read',
        Key: fileName,
        Body: stream
      };

      s3.putObject(params, function(err, data){
        if (err){
          console.log(err)
        }else{
          fs.unlink(req.file.path, function(err){
            if (err){
              console.log(err)
              console.log("ERROR OF UNLINK")
            } else {
              console.log("UNLINK NO PROBLEMS")
            }
          });
          callbackk();
        }
      });
    } else {
      console.log("CALLED BACK WITOUT FILE")
      callbackk();
    }
  }


  checkifava(function(){
    console.log("CALLED BACK THE FONCTION")
    var phoneCode = randomIntFromInterval(10000, 100000)
    var newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      city: city,
      avatar: ava,
      password: password,
      verifyEmailString: rand,
      phone: phone,
      phoneVerification: phoneCode
    });

    console.log(newUser);


    User.createUser(newUser, function(err, user){
      if(err) throw err;
      var mailOptions = {
          from: '"Fason service client" <fason.contact@gmail.com>', // sender address
          to: "fason.contact@gmail.com", //
          subject : "Un nouveau utilisateur vient de s'inscrire!",
          html : "Nouveau user bro inscrit! <br> "+ user.firstName +" "+user.lastName+" "+user.id
      };
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
            console.log(error);
          }
      });

      var mailOptions2 = {
          from: '"Fason service client" <fason.contact@gmail.com>',
          to: user.email, //
          subject : "Confirmation d'inscription",
          html : "<p>Votre compte a été crée avec succès. Nous sommes heureux de vous compter parmi nos membres. <br> Connectez-vous en appuyant <a href='http://fason.co/'>ICI</a><br>L'équipe Fason.</p>"
      };
      transporter.sendMail(mailOptions2, function(error, info){
          if(error){
            console.log(error);
          }
      });
      req.login(newUser, function(err){
        if (err){console.log(err)}
        if(client == "on"){
          res.redirect("http://fason.co/")
        } else {
          res.redirect("http://fason.co/createstylebox")
        }
      });
    });
  })
})

router.get('/verify', function(req, res){
  User.getUserByVerifyEmailString(req.query.id, function(err, user){
    if(err){
      console.log(err);
      res.send('Sorry there were something wrong please try again');
    } else {
    		if(req.query.id == user.verifyEmailString){
    		  res.send("<h1>Félicitations, vous avez vérifié votre e-mail.</h1>");
    			user.varified = true;
    			user.save(function(err){
    				if (err){
    					console.log(err);
    				} else {
              var phoneVerified = user.phoneIsVerified;
              pusher.trigger(user.id, 'emailVerify', {"emailverified": true, "phoneV": phoneVerified});
            }
    			});
    	  } else {
    		  res.end("Bad Request");
    	  }
    }
  });
});

passport.use(new LocalStrategy({
	usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},
  function(req, email, password, done) {
   User.getUserByEmail(email, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login', function(req, res) {

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

    var lemail = req.body.lemail;
    var lpassword = req.body.lpassword;
    var errors = [];
    if(!lemail){
      var err = {param:'lemail', msg: 'Veuillez saisir votre e-mail.', value: "yes"}
      errors.push(err);
    }
    if (lemail){
      if(!validateEmail(lemail)){
        var err = {param:'lemail', msg: "E-mail n'est pas valide.", value: "yes"}
        errors.push(err);
      }
    }
    if(!lpassword){
      var err = {param:'lpassword', msg: "Veuillez saisir votre mot de passe.", value: "yes"}
      errors.push(err);
    }
      var promise = new Promise(function(resolve, reject){
        User.getUserByEmail(lemail, function(err, user){
          if (user){
            bcrypt.compare(lpassword, user.password, function(err, isMatch) {
              if (isMatch){
                resolve(errors);
              } else {
                if(lemail && lpassword){
                  errors.push({param: 'invaliduser', msg: 'E-mail ou mot de passe incorrect.'});
                }
                resolve(errors);
              }
          	});
          } else {
            if(lemail && lpassword){
              errors.push({param: 'invaliduser', msg: 'E-mail ou mot de passe incorrect.'});
            }
            resolve(errors);
          }
        });
      }).then(function(response){
        if (response.length !== 0){
          res.send({errors: response});
        } else {
          res.send({valid: true});
        }
      }).catch(function(err){
        console.log(err);
      })
});


router.post('/loginValid', passport.authenticate('local'), function(req, res){
  res.send(true);
});

// LOGOUT GET METHOD
router.get('/logout', function(req, res){
	req.logout();
  res.redirect('http://fason.co/');
});


// REQUEST A NEW PASSWORD
router.post('/requestpasswordreset', function(req, res){
  var lemail = req.body.email;
  var email = lemail.toLowerCase();
  req.checkBody('email', "Veuillez entrer votre e-mail").notEmpty();
  req.checkBody('email', 'Adresse e-mail invalid').isEmail();
  var errors = req.getValidationResult() || [];

   User.getUserByEmail(req.body.email, function(err, user){
    if (!user){
      res.send({"err": "Aucun membre avec cette adresse e-mail.", "errors": errors});
    } else {
      var uniqueId = bcrypt.hashSync(uuid.v1());
      uniqueId.replace(/[^a-zA-Z0-9]/g, '');

      function removeSpecials(str) {
          var lower = str.toLowerCase();
          var upper = str.toUpperCase();

          var res = "";
          for(var i=0; i<lower.length; ++i) {
              if(lower[i] != upper[i] || lower[i].trim() === '')
                  res += str[i];
          }
          return res;
      }

      user.resetPwdString = removeSpecials(uniqueId);
      user.save();
      var passwordResetLink = "http://"+req.get('host')+"/resetPassword/"+removeSpecials(uniqueId);
      var mailOptionsReset = {
          from: '"Fason service client" <fason.contact@gmail.com>', // sender address
          to: email, // list of receivers
          subject : "Changer mon mot de passe de Fason",
          html : "Bonjour,<br> Vous allez procéder au changement de votre mot de passe. <br><a href="+passwordResetLink+">Cliquez ici pour commencer.</a></br><p>Ce lien expire dans quelques heures. Si vous ne l'avez pas utilisé dans le temps, redemandez un autre sur fason.co</p>"
      };

      transporter.sendMail(mailOptionsReset, function(error, info){
          if(error){
              return console.log(error);
          } else {
            res.send({"sent": "Nous venons de vous envoyer un e-mail avec les instructions afin de changer votre mot de passe. N'oubliez pas de vérifier dans la rubrique Spam de votre boîte e-mail."});
          }
      });
    }
  });
});

// THIS ROUTE HELPS TO SEND THE NEW PASSWORD BACK TO THE SERVER AND CHANGE THE INFO IN THE DB ALSO HASHING THE NEW PASSWORD
router.post('/resetPassword/:id', function(req, res){
  var id = req.params.id;
  var password = req.body.password.toLowerCase();
  // New method created in the user model file to find a user with the resetToken that is in the db
  User.getUserByResetToken(id, function(err, user){
    if (err){
      res.send({"erreur": true})
    } else {
        user.password = bcrypt.hashSync(password);
        user.resetPwdString = "";
        user.save();
        res.send({"changed": true});
    }
  })
});

router.get('/requestnewpws', function(req,res){
  res.render('requestpassword')
})

router.get('/currentUser', function(req, res){
  if(req.user){
    res.send(req.user.id);
  } else {
    res.send(false);
  }
});

router.post('/sendMsg', function(req, res){
  if(req.user){
    var from = req.user.firstName;
    var message = req.body.message;
    var styleboxId = req.body.styleboxId;
    var userId = req.user.id
    Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
      if(req.user.id == stylebox.creator){
        res.send({"creator": true})
      } else {
        var conversation = new Conversation({
          messages: [{
              msg: message,
              msgOwner: userId,
              msgOwnerName: from
            }],
          participants: [userId, stylebox.creator]
        });

        Conversation.createNewConversation(conversation, function(err, createdConversation){
          if (err){
            res.send('there is an error: %s', err);
          } else {
            req.user.conversations.push(conversation);
            req.user.save();
            User.getUserById(stylebox.creator, function(err, user){
              if (user){
                user.conversations.push(conversation);
                user.save();
                var obj = {"msg": conversation.msg, "msgOwnerName": conversation.msgOwnerName, "participants": conversation.paricipants, "avatar": req.user.avatar, "msgTime": conversation.msgTime};
                pusher.trigger(user.id, 'new-message', obj);
                res.send({"sent":true});
              }
            });
          }
        })
      }
    })
  } else {
    res.redirect("http://fason.co/")
  }
});

router.post('/becomestylist', function(req, res){
  if(req.user){
    var description = req.body.description;
    var availability = req.body.availability;
    var user = req.user;

    if(description){
      user.stylist.status = true;
      user.stylist.description = description;
      user.stylist.availability = availability;
      user.save(function(err, user){
        if(err){
          console.log(err)
          res.send({"err": "Une erreur s'est produite, veuillez réessayer plus tard."})
        } else {
          res.send({"stylist": true});
        }
      });
    }
  } else {
    res.redirect("http://fason.co/")
  }
});

module.exports = router;
