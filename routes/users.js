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
var client = new twilio.RestClient((process.env.TWILLIO_SECRET  ||  'AC0f6433c5d0713b85184d77e30383fd4f'),( process.env.TWILLIO_KEY || 'cbac6157842210b60de45dab4f90f9fa'));
// Params setting for pusher -> REAL TIME NOTIFICATIONS SYSTEM
var pusher = new Pusher({
  appId: (process.env.PUSHER_ID || '283453'),
  key: (process.env.PUSHER_KEY || '095ff3028ab7bceb6073'),
  secret: (process.env.PUSHER_SECRET || '25077850beef8ae1d148'),
  encrypted: true
});

// Phone code generator
function randomIntFromInterval(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}


// EMAIL SMTP SETTING -> This will be mailgun
var transporter = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "fason.contact@gmail.com",
        pass: (process.env.MAIL_PASS || "Mokoloko123")
    }
});
// Setting the body parser for json
router.use(bodyParser.json());
var rand, link, host;

// REGISTRATION POST -> With variables for email verification process
AWS.config = {
  accessKeyId: (process.env.AWS_KEY || 'AKIAJ5ZF3LOCVCPMJ5LQ'),
  secretAccessKey: (process.env.AWS_SECRET || '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')
}
var s3 = new AWS.S3();

var uploadMulter = multer({dest: 'public/img'})

router.post('/setavatar', uploadMulter.single('displayImage'), function(req, res){
  if(req.file){
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

    User.getUserById(req.body.userId, function(err, user){
      if(err){
        console.log(err)
      }else{
        user.avatar = "https://s3.amazonaws.com/styleboxphotosfason/"+fileName
        user.save();
        if(req.body.userType == "user"){
          setTimeout(function () {
            res.redirect("http://fason.co/")
          }, 1000)
        } else {
          setTimeout(function () {
            res.redirect("http://fason.co/createstylebox")
          }, 1000)
        }
      }
    })
  } else {
    if(req.body.userType == "user"){
      res.redirect("http://fason.co/")
    } else {
      res.redirect("http://fason.co/createstylebox")
    }
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
    var userDescription = req.user.stylist.description;
    var userAvailability = req.user.stylist.availability;
    res.render('profile', {"userAvailability": userAvailability, "userDescription":userDescription, "userAvatar": userAvatar, "userFirstName":userFirstName, "userLastName":userLastName, "userCity":userCity, "userEmail":userEmail, "userPhone":userPhone, "user":req.user});
  } else {
    res.redirect("http://fason.co/")
  }
});

router.post('/updateprofil', function(req, res){
  if(req.user){
    function updateprofil(callback){
      var userFirstName = req.body.userFirstName;
      var userLastName = req.body.userLastName;
      var userEmail = req.body.userEmail;
      var userPhone = req.body.userPhone;
      var userCity = req.body.userCity;
      var userDescription = req.body.userDescription;
      var userAvailability = req.body.userAvailability;
      var userPassword = req.body.userPassword;
      var user = req.user;
      var descriptionCount = req.body.descriptionCount;

      req.checkBody('userFirstName', 'Veuillez saisir votre nom.').notEmpty();
    	req.checkBody('userLastName', 'Veuillez saisir votre prénom.').notEmpty();
    	req.checkBody('userEmail', 'Veuillez saisir votre e-mail.').notEmpty();
      req.checkBody('userPhone', 'Veuillez saisir votre numéro de potable.').notEmpty();
      req.checkBody('userCity', "Veuillez saisir votre ville de résidence.").notEmpty();
      req.checkBody('userEmail', 'Veuillez saisir votre e-mail.').isEmail();

      if(userPassword){
        req.checkBody('userPassword', 'Le mot de passe doit être compris entre 6 et 20 caractères.').len(6, 20);
      }

      var errors = req.validationErrors() || [];

      if(req.user.stylist.status){
        if(descriptionCount < 200){
          errors.push({"msg":"Résumez votre expérience dans la mode/beuté (minimum 200 caractères)."});
        }
      }

      if(errors.length){
        console.log(errors);
        res.send({"errors":errors})
      } else {
        if(userFirstName !== user.firstName){
          user.firstName = userFirstName;
          user.save();
        }

        if(userAvailability){
          user.stylist.availability = userAvailability;
          user.save();
        }

        if(userDescription){
          user.stylist.description = userDescription;
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


        if(userCity !== user.city){
          user.city = userCity;
          user.save();
        }
        callback(user)
      }
    }

    updateprofil(function(user){user.save(); res.send({"ok":true})})
  } else {
    res.redirect("http://fason.co/")
  }
});

router.post('/updateavatar', uploadMulter.single('displayImage'), function(req, res){
  if(req.user){
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

      User.getUserById(req.user.id, function(err, user){
        if(err){
          console.log(err)
        }else{
          user.avatar = "https://s3.amazonaws.com/styleboxphotosfason/"+fileName
          user.save();
          setTimeout(function () {
            res.redirect("http://fason.co/")
          }, 1000)

        }
      })
    } else {
      res.redirect("http://fason.co/")
    }
  } else {
    res.redirect("http://fason.co/")
  }
})


router.post('/register', function(req, res){
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var email = req.body.email;
	var password = req.body.password;
  var city = req.body.city;
	var terms = req.body.conditions;
  var phone = req.body.phone;
  var userType = req.body.userType;

  if (phone != null){
    if (phone.charAt(0) == 0){
      phone = phone.substring(1);
      phone = "+33"+phone;
    }
  }

	// Body-Validations with express validators
  req.checkBody('firstName', 'Veuillez saisir votre nom.').notEmpty();
	req.checkBody('lastName', 'Veuillez saisir votre prénom.').notEmpty();
  req.checkBody("city", "Veuillez saisir votre ville de résidence.").notEmpty();
	req.checkBody('email', 'Veuillez saisir votre e-mail.').notEmpty();
  req.checkBody('phone', 'Veuillez saisir votre numéro de potable.').notEmpty();
  req.checkBody("userType", "Précisez quel type d'utilisateur êtes-vous.").notEmpty();

  if(email != ""){
    req.checkBody('email', "E-mail n'est pas valide.").isEmail();
  }
	req.checkBody('password', 'Veuillez saisir le mot de passe.').notEmpty();
  if(password != ""){
    req.checkBody('password', 'Le mot de passe doit être compris entre 6 et 20 caractères.').len(6, 20);
  }

  // rand is the string that will represent the email validation string that will be saved in the user schema in the DB
  rand =  bcrypt.hashSync(uuid.v1());
	// all errors are stored here in errors variable
	var errors = req.validationErrors() || [];

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
    if(terms == false){
      errors.push({param:'conditions', msg: "Veuillez accepter les conditions générales d'utilisation."});
    }
    return errors
  }).then(function(result){
    if(result.length !== 0){
      // promise to keep things ordered
      res.send({errors: result});
  	} else {
      var phoneCode = randomIntFromInterval(10000, 100000)
  	   // if no error create a user prototype that will be sent to user model to be saved
  		var newUser = new User({
  			firstName: firstName,
  			lastName: lastName,
  			email: email,
        city: city,
  			password: password,
        verifyEmailString: rand,
        phone: phone,
        phoneVerification: phoneCode
  		});


  		// User creation process caling the User model method to create the user
  		User.createUser(newUser, function(err, user){
  			if(err) throw err;
        var mailOptions = {
            from: '"Fason service client" <fason.contact@gmail.com>', // sender address
            to: "fason.contact@gmail.com", //
            subject : "Un nouveau utilisateur vient de s'inscrire!",
            html : "Nouveau user bro inscrit!"
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
        });

        var mailOptions2 = {
            from: '"Fason service client" <fason.contact@gmail.com>', // sender address
            to: user.email, //
            subject : "Confirmation d'inscription",
            html : "<p>Votre compte à été crée avec succées. Nous sommes heureux de vous compter parmis nos membres. <br> Connectez vous en appuyant <a href='http://fason.co/'>ICI</a></br>L'équipe Fason.</p>"
        };
        transporter.sendMail(mailOptions2, function(error, info){
            if(error){
                return console.log(error);
            }
        });
  			req.login(newUser, function(err){
  				if (err){console.log(err);}
  				if (userType == "stylist"){
  					res.send({"stylist": true, "ok":true, "userId":user.id});
  				} else {
  					res.send({"user": true, "ok":true, "userId":user.id});
  				}
  			});
  		});
  	}
  });
});

router.get('/verify', function(req, res){
  // Getting the user by veritfy email string that is passed as param in the link that was sent to the user
  User.getUserByVerifyEmailString(req.query.id, function(err, user){
    if(err){
      console.log(err);
      res.send('Sorry there were something wrong please try again');
    } else {
      // verifiying that the protocol is the same as expected
    		if(req.query.id == user.verifyEmailString){
          // if so then we change the verified variable to true in the DB
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
          // else we send an error BAD REQUEST
    		  res.end("Bad Request");
    	  }
    }
  });
});

// PASSPORT STRATEGY DECLARATION
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

// PASSPORT TOKEN SERIALIZATION
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// PASSPORT TOKEN DESERIALIZATION
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// This method is for our ajax request to handle the errors if there is no more errors the next route will be called
router.post('/login', function(req, res) {
    var lemail = req.body.lemail;
    var lpassword = req.body.lpassword;
    req.checkBody('lemail', 'Veuillez saisir votre e-mail.').notEmpty();
    if (lemail){
      req.checkBody('lemail', "E-mail n'est pas valide.").isEmail();
    }
    req.checkBody('lpassword', 'Veuillez saisir votre mot de passe.').notEmpty();

    var errors = req.validationErrors() || [];
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


// This one is called when the /login route verify that there is no more errors so we can now sign in with the correct parameters
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
  var errors = req.validationErrors() || [];

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
      // SEND THE EMAIL PROCESS BEGIN ******************************************************
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

//MESSAGE RECEIVE ROUTE
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
