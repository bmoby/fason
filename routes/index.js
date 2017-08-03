var express = require('express');
var router = express.Router();
var Conversation = require('../models/conversation');
var Promise = require('promise');
var Pusher = require('pusher');
var User = require('../models/user');
var Eval = require('../models/eval');
var Stat = require('../models/stats');
var moment = require('moment');
var Stylebox = require('../models/stylebox');
var Connu = require('../models/connu');
var Comments = require('../models/comment');
var aggregate = Stylebox.aggregate();
var Demand = require('../models/demand');
var nodemailer = require('nodemailer');
var twilio = require('twilio');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var AWS = require('aws-sdk');

var pusher = new Pusher({
  appId: (process.env.PUSHER_ID),
  key: (process.env.PUSHER_KEY),
  secret: (process.env.PUSHER_SECRET),
  encrypted: true
});

var client = new twilio.RestClient(process.env.TWILLIO_SECRET, process.env.TWILLIO_KEY);

AWS.config = {
  accessKeyId: (process.env.AWS_KEY),
  secretAccessKey: (process.env.AWS_SECRET)
}
var s3 = new AWS.S3();

// Params setting nodemailer transporter
var transporter = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "fason.contact@gmail.com",
        pass: (process.env.MAIL_PASS)
    }
});
router.get('/', function(req, res) {
  var styleboxeslist = ["59023e25706a880004de41e2", "5908a0d3e9c0420004aa7873", "59004e38d69fa00004b1be88","5926c125e9af4a00048f5781","58ff12e576678d00041d4be2","5907598f25a0760004f2abbc"];
  var liststyleboxes = [];

  function generalfunc(callback){
    styleboxeslist.forEach(function(styleboxid, indexs, objects){
      Stylebox.getStyleboxById(styleboxid, function(err, stylebox){
        if(stylebox){
          User.getUserById(stylebox.creator, function(err, user){
            var generalRat = 0;
            var sommeRat = 0;
            if(stylebox.rating.length){
              stylebox.rating.forEach(function(rat, indexx, objectt){
                var sommeOneRat = rat.precision + rat.qualityprice + rat.communication + rat.ponctuality;
                var moyenneOneRat = sommeOneRat/4;
                sommeRat = sommeRat + moyenneOneRat;

                if(indexx+1 == objectt.length){
                  generalRat = sommeRat / objectt.length;
                  var styleboxproto = {};
                  styleboxproto.lastName = user.lastName;
                  styleboxproto.stylistava = user.avatar;
                  styleboxproto.price = stylebox.price;
                  styleboxproto.description = stylebox.description;
                  styleboxproto.id = stylebox.id;
                  styleboxproto.rating = generalRat;
                  liststyleboxes.push(styleboxproto);
                  if(indexs == 2){
                    callback(liststyleboxes);
                  }
                }
              })
            } else {
              var styleboxproto = {};
              styleboxproto.rating = -1;
              styleboxproto.lastName = user.lastName;
              styleboxproto.stylistava = user.avatar;
              styleboxproto.price = stylebox.price;
              styleboxproto.id = stylebox.id;
              styleboxproto.description = stylebox.description;
              liststyleboxes.push(styleboxproto);
              if(indexs+1 == objects.length){
                callback(liststyleboxes);
              }
            }
          })
        } else {
          console.log("here is going the rand code");
        }
      });
    });
  }

  generalfunc(function(stylelist){
    console.log(stylelist)
    if(req.user){
      var notifcount = 0;
      var newdemands = 0;
      var allnotifs = 0;

      if(req.user.notifications.length){
        notifcount = req.user.notifications.length;
      }

      if(req.user.demandNotifications.length){
        newdemands = req.user.demandNotifications.length;
      }

      if(req.user.demandNotifications.length || req.user.notifications.length){
        allnotifs = req.user.demandNotifications.length + req.user.notifications.length;
      } else if (req.user.demandNotifications.length && req.user.notifications.length){
        allnotifs = req.user.demandNotifications.length + req.user.notifications.length;
      }
      res.render('index', {"user": req.user,"newmessages": notifcount,"newdemands": newdemands,"allNotifications": allnotifs, "styleboxes":stylelist});
    } else {
      res.render('index', {"styleboxes":stylelist});
    };
  })
});

router.get('/cmc', function(req, res) {
  var styleboxeslist = ["59760b6ba88a351bcf0aa9f1", "59760b6ba88a351bcf0aa9f2", "597b5f0e7b07ff2666c7082e"];
  var liststyleboxes = [];

  function generalfunc(callback){
    styleboxeslist.forEach(function(styleboxid, indexs, objects){
      Stylebox.getStyleboxById(styleboxid, function(err, stylebox){
        if(stylebox){
          User.getUserById(stylebox.creator, function(err, user){
            var generalRat = 0;
            var sommeRat = 0;
            if(stylebox.rating.length){
              stylebox.rating.forEach(function(rat, indexx, objectt){
                var sommeOneRat = rat.precision + rat.qualityprice + rat.communication + rat.ponctuality;
                var moyenneOneRat = sommeOneRat/4;
                sommeRat = sommeRat + moyenneOneRat;

                if(indexx+1 == objectt.length){
                  generalRat = sommeRat / objectt.length;
                  var styleboxproto = {};
                  styleboxproto.lastName = user.lastName;
                  styleboxproto.stylistava = user.avatar;
                  styleboxproto.price = stylebox.price;
                  styleboxproto.description = stylebox.description;
                  styleboxproto.id = stylebox.id;
                  styleboxproto.rating = generalRat;
                  liststyleboxes.push(styleboxproto);
                  if(indexs == 2){
                    callback(liststyleboxes);
                  }
                }
              })
            } else {
              var styleboxproto = {};
              styleboxproto.rating = -1;
              styleboxproto.lastName = user.lastName;
              styleboxproto.stylistava = user.avatar;
              styleboxproto.price = stylebox.price;
              styleboxproto.id = stylebox.id;
              styleboxproto.description = stylebox.description;
              liststyleboxes.push(styleboxproto);
              if(indexs+1 == objects.length){
                callback(liststyleboxes);
              }
            }
          })
        } else {
          console.log("here is going the rand code");
        }
      });
    });
  };

  generalfunc(function(stylelist){
    console.log(stylelist)
    if(req.user){
      var notifcount = 0;
      var newdemands = 0;
      var allnotifs = 0;

      if(req.user.notifications.length){
        notifcount = req.user.notifications.length;
      }

      if(req.user.demandNotifications.length){
        newdemands = req.user.demandNotifications.length;
      }

      if(req.user.demandNotifications.length || req.user.notifications.length){
        allnotifs = req.user.demandNotifications.length + req.user.notifications.length;
      } else if (req.user.demandNotifications.length && req.user.notifications.length){
        allnotifs = req.user.demandNotifications.length + req.user.notifications.length;
      }
      res.render('index', {"user": req.user,"newmessages": notifcount,"newdemands": newdemands,"allNotifications": allnotifs, "styleboxes":stylelist});
    } else {
      res.render('index', {"styleboxes":stylelist});
    };
  });

});


router.post('/connu', function(req, res){
  if(req.user){
    var user = req.user;
    var moyen  = req.body.moyen;
    var newconnu = {"moyen": moyen, "creator": user.id};
    Connu.createNewConnu(newconnu, function(err, savedConnu){
      if(err){
        console.log(err)
        res.send({"err": "Essayez plus tard"})
      } else {
        user.connu = false;
        user.save();
        res.send({"saveok": true})
      }
    })

  } else {
    res.redirect("http://fason.co/")
  }
})

router.get('/search', function(req, res){
  if(req.user){
    res.render('search', {"user": req.user, "newmessages": req.user.notifications.length, "errmsg": "Veuillez appuyer sur Recherche.", "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  } else {
    res.render('search', {"errmsg": "Veuillez appuyer sur Recherche."});
  }
})


router.post('/search', function(req, res){
  var city = req.body.city;
  var gender = req.body.gender;
  var categorie = req.body.style;

  // Helper functions
  function calculaterating(rating, callback){
    var generalRat = 0;
    var sommeRat = 0;
    if(rating.length){
      rating.forEach(function(rat, index, object){
        var sommeOneRat = rat.precision + rat.qualityprice + rat.communication + rat.ponctuality;
        var moyenneOneRat = sommeOneRat/4;
        sommeRat = sommeRat + moyenneOneRat;

        if(index+1 == object.length){
          generalRat = sommeRat / object.length;
          console.log("evaluations le compte est", object.length)
          callback(generalRat);
        }
      })
    } else {
      callback(-1);
    }
  }

  var promise = new Promise(function(resolve, reject){
    var options = {};
    options.creator = {"$exists" : true};
    options.valid = true;
    if(city){
      options.city = { "$regex": city, "$options": "i" }
    }
    if(gender == "men"){
      options.men = true;
    }
    if(gender == "ladies"){
      options.women = true;
    }
    if(categorie == "vestimentaire"){
      options.relookingtrue = true;
    }
    if(categorie == "beaute"){
      options.beautetrue = true;
    }

    if(categorie == "corses"){
      options.corsestrue = true;
    }
    resolve(options);
  }).then(function(obje){
    Stylebox.find(obje, function(err, styleboxes){
      if (err){
        console.log(err)
      } else {
        var styleboxesandstylist = [];
        if(styleboxes.length != 0){
          styleboxes.forEach(function(stylebox, index, object){
              User.getUserById(stylebox.creator, function(err, user){
                var stylistava = user.avatar;
                var name = user.firstName;
                var generalRat = -1;
                  if(stylebox.rating.length != 0){
                    calculaterating(stylebox.rating, function(raag){
                      generalRat = raag;
                      var styleboxProto = {"firstName": name, "stylistava": stylistava, "description": stylebox.description, "rating": generalRat, "ratCount": stylebox.rating.length, "price": stylebox.price, "id": stylebox.id};
                      styleboxesandstylist.push(styleboxProto);
                      if(index + 1 == object.length){
                        if(req.user){
                          res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user, "newmessages": req.user.notifications.length,   "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
                        } else {
                          res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user});
                        }
                      }
                    });
                  } else {
                    var styleboxProto = {"firstName": name, "stylistava": stylistava, "description": stylebox.description, "rating": generalRat, "ratCount": stylebox.rating.length, "price": stylebox.price, "id": stylebox.id};
                    styleboxesandstylist.push(styleboxProto);
                    if(index + 1 == object.length){
                      if(req.user){
                        res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user, "newmessages": req.user.notifications.length,   "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
                      } else {
                        res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user});
                      }
                    }
                  }
              });
          })
        } else {
          if(req.user){
            res.render('search', {"user": req.user, "newmessages": req.user.notifications.length, "errmsg": "Aucun relooker ne correspond à votre recherche", "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length})
          } else {
            res.render('search', {"user": req.user, "errmsg": "Aucun look ne correspond à votre recherche"})
          }
        }
      }
    })
  }).catch(function(err){
    console.log(err);
  })
})

router.get('/stylebox/:id', function(req, res){
  var styleboxId = req.params.id;
  function calculaterating(rating, callback){
    var sommeRat = 0;
    var precisionRat = 0;
    var qualitypriceRat = 0;
    var communicationRat = 0;
    var ponctualityRat =0;

    if(rating.length){
      rating.forEach(function(rat, index, object){
        var sommeOneRat = rat.precision + rat.qualityprice + rat.communication + rat.ponctuality;
        var moyenneOneRat = sommeOneRat/4;
        sommeRat = sommeRat + moyenneOneRat;
        precisionRat = precisionRat + rat.precision;
        qualitypriceRat = qualitypriceRat + rat.qualityprice;
        communicationRat = communicationRat + rat.communication;
        ponctualityRat = ponctualityRat + rat.ponctuality;

        if(index+1 == object.length){
          var generalRat = sommeRat / object.length;
          var precRat = precisionRat / object.length;
          var qualiRat = qualitypriceRat / object.length;
          var commuRat = communicationRat / object.length;
          var ponctuRat = ponctualityRat / object.length;

          var allRats = {"general": generalRat, "precision": precRat, "quality": qualiRat, "communication": commuRat, "ponctuality": ponctuRat};
          callback(allRats);
        }
      })
    } else {
      var allRats = {"general": -1, "precision": -1, "quality": -1, "communication": -1, "ponctuality": -1};
      callback(allRats);
    }
  }

  var styleboxproto = {};
  var promise = new Promise(function(resolve, reject){
    var haveToVerify = false;
    if(req.user){
      if(req.user.varified == false || req.user.phoneIsVerified == false){
        haveToVerify = true;
      }
    }
    Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
      if(stylebox){
        User.getUserById(stylebox.creator, function(err, user){
          calculaterating(stylebox.rating, function(allrats){
            styleboxproto.lastName = user.lastName;
            styleboxproto.price = stylebox.price;
            styleboxproto.avatar = user.avatar;
            styleboxproto.description = stylebox.description;
            styleboxproto.generalprocess = stylebox.generalprocess;
            styleboxproto.id = stylebox.id;
            styleboxproto.city = stylebox.city;
            styleboxproto.men = stylebox.men;
            styleboxproto.women = stylebox.women;
            styleboxproto.relooking = stylebox.relooking;
            styleboxproto.beaute = stylebox.beaute;
            styleboxproto.corses = stylebox.corses;
            styleboxproto.rating = allrats;
            styleboxproto.number = stylebox.rating.length;
            // Hnadlebars helpers

            if(req.user){
              console.log(styleboxproto)
              res.render('stylebox-display',{user: req.user, stylebox: styleboxproto, "haveToVerify": haveToVerify})
            } else {
              console.log(styleboxproto)
              res.render('stylebox-display',{stylebox: styleboxproto})
            }
          })
        })
      } else {
        res.render('styleboxnotfound')
      }
    })
  })
});

router.post('/demand', function(req, res){
  var date = req.body.date;
  var styleboxId = req.body.styleboxId;
  var forstyle = req.body.forstyle.toString();
  var creator = req.user.id;
  var dateDay = date.substr(0, 2);
  var dateMonth = date.substr(3, 2);
  var dateYear = date.substr(6, 4);
  var dateTime = date.substr(13, 5);
  var jsonDate = dateYear+'-'+dateMonth+'-'+dateDay+'T'+dateTime;
  var demandTime = new Date(jsonDate);
  var connectedUser = req.user;
  var promise = new Promise(function(resolve, reject){
    if(req.user.demands.length == 0){
      resolve(connectedUser)
    } else {
      updateDemands(function(){
        resolve(connectedUser);
      });
    }

    function updateDemands(callback){
      connectedUser.demands.forEach(function(demand, index, object){
        Demand.getDemandById(demand, function(err, dem){
          var newDate = moment(dem.createdTime);
          var now = moment();
          var diff = now.diff(newDate, 'hours');
          if(diff >= 24 && dem.valid == true){
              dem.participants.forEach(function(participant, indexparticipant, objectparticipant){
                User.getUserById(participant, function(err, user){
                  if(user.demands.length){
                    user.demands.forEach(function(deman, indexdem, objectdem){
                      if(deman == dem.id){
                        user.demands.splice(indexdem, 1);
                        user.save();
                      }
                    })
                  }
                  if(user.demandNotifications.length){
                    user.demandNotifications.forEach(function(notif, indexnotif, objectnotif){
                      if(notif.demandid == dem.id){
                        user.demandNotifications.splice(indexnotif, 1);
                        user.save();
                      }
                    })
                  }
                })
                  dem.valid = false;
                  dem.save();
                  setTimeout(function(){
                    callback(connectedUser)
                  }, 2000)
              })
          } else {
            if(index +1 == object.length){
              callback(connectedUser)
            }
          }
        })
      })
    }
  }).then(function(){
    Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
      if(req.user.id == stylebox.creator){
        res.send({"creator": true});
      } else {
        var validDemand = false;
        if(req.user.demands.length == 0){
          // Creating a prototype of the demand
          var newDemand = {
            creator: creator,
            participants:[creator, stylebox.creator],
            time: demandTime,
            forStylebox: styleboxId,
            creatorName: req.user.lastName,
            forstyle: forstyle
          }

          Demand.createNewDemand(newDemand, function(err, savedDemand){
            if(err){
              console.log(err)
            } else {
              var comDate = moment(savedDemand.time, "DD-MM-YYYY").add(14, 'days');
              var demandee = {
                type: "recu",
                client: req.user.lastName,
                clientAva: req.user.avatar,
                date: jsonDate,
                commentTime: comDate,
                createdTime: savedDemand.createdTime,
                clientPhone: req.user.phone
              }
              User.getUserById(stylebox.creator, function(err, user){
                if (err){
                  console.log(err)
                } else {
                  user.demandNotifications.push({"demandid": savedDemand.id});
                  user.demands.push(savedDemand);
                  user.save();
                  pusher.trigger(user.id, 'demands', demandee);
                  res.send({"ok": true})
                }
              });
              User.getUserById(stylebox.creator, function(err, user){
                client.sms.messages.create({
                  to:user.phone,
                  from:'+33644607659',
                  body:'FASON : Nouvelle demande.'+' Contactez '+req.user.lastName+' au '+req.user.phone,
                }, function(err, message) {
                  if(err){
                    console.log(err);
                  }
                })
              })
            }
          })
        } else {
          req.user.demands.forEach(function(demId, index){
            Demand.getDemandById(demId, function(err, dem){
              if(dem.valid == true){
                validDemand = true;
              }
              if(index + 1 == req.user.demands.length){
                if (validDemand){
                  res.send({"err":"Vous avez une demande en cours."})
                } else {
                  var newDemand = {
                    creator: creator,
                    participants:[creator, stylebox.creator],
                    time: demandTime,
                    forStylebox: styleboxId,
                    creatorName: req.user.lastName,
                    forstyle: forstyle
                  }
                  Demand.createNewDemand(newDemand, function(err, savedDemand){
                    if(err){
                      console.log(err)
                    } else {
                      var comDate = moment(savedDemand.time, "DD-MM-YYYY").add(14, 'days');
                      var demand = {
                        type: "recu",
                        client: req.user.lastName,
                        clientAva: req.user.avatar,
                        date: jsonDate,
                        commentTime: comDate,
                        createdTime: savedDemand.createdTime,
                        clientPhone: req.user.phone
                      }

                      User.getUserById(stylebox.creator, function(err, user){
                        if (err){
                          console.log(err)
                        } else {
                          client.sms.messages.create({
                            to:user.phone,
                            from:'+33644607659',
                            body:'FASON : Nouvelle demande.'+' Contactez '+req.user.lastName+' au '+req.user.phone,
                          }, function(err, message) {
                            if(err){
                              console.log(err);
                            }
                          })
                          user.demandNotifications.push({"demandid": savedDemand.id});
                          user.demands.push(savedDemand);
                          user.save();
                          pusher.trigger(user.id, 'demands', demand);
                          res.send({"ok": true})
                        }
                      });
                      var demanidd = savedDemand.id;
                      var mailOptions = {
                          from: '"Fason service client" <fason.contact@gmail.com>', // sender address
                          to: "fason.contact@gmal.com", // list of receivers
                          subject : "New dem bro",
                          html : "Nouvelle demande pas encore acceptée <br><br> id : "+demanidd
                      };
                      transporter.sendMail(mailOptions, function(error, info){
                          if(error){
                              return console.log(error);
                          }
                      });
                    }
                  })
                }
              }
            })
          })
        }
      }
    })
  })
});

router.get('/sendPhoneCode', function(req, res){
  if(req.user){
    var code = req.user.phoneVerification;
    client.sms.messages.create({
      to:req.user.phone,
      from:'+33644607659',
      body:'Votre code FASON :'+ code,
    }, function(error, message) {
      if (!error) {
          res.send({"smsSent": true})
      }
    });
  } else {
    res.redirect("http://fason.co")
  }
});

router.get('/sendEmailVerify', function(req, res){
  if(req.user){
    var link = "http://fason.co/users/verify?id="+req.user.verifyEmailString;
    var mailOptions = {
        from: '"Fason service client" <fason.contact@gmail.com>', // sender address
        to: req.user.email, // list of receivers
        subject : "Veuillez confirmer votre e-mail",
        html : "Bonjour,<br> Cliquez sur ce lien afin de confirmer votre e-mail.<br><a href="+link+">Lien de confirmation</a>"
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        } else {
          res.send({"userId": req.user.id});
        }
    });
  } else {
    res.redirect("http://fason.co/");
  }
});

router.post('/verifyMyPhone', function(req, res){
  if(req.user){
    var code = req.body.code;
    if (req.user.phoneVerification == code){
      var user = req.user;
      user.phoneIsVerified = true;
      var emailV = user.varified;
      user.save();
      res.send({"phoneVerify": true, "emailV": emailV, "userId": req.user.id});
      pusher.trigger(req.user.id, 'phoneVerify', {"phoneverified": true, "emailV": emailV});
    } else {
      res.send({"err":"Le code est incorrect"})
    }
  } else {
    res.redirect("http://fason.co")
  }
});

router.get('/currentUser', function(req, res){
  if(req.user){
    res.send({'userId': req.user.id})
  } else {
    res.send("no user connected")
  }
})

router.get('/createstylebox', function(req, res){
  if(req.user && !req.user.styleboxes){
    res.render('createstylistprofile', {"user": req.user});
  } else {
    res.redirect('http://fason.co/');
  }
})


var uploadMulter = multer({dest: 'public/img'})

router.post('/createstylebox', function(req, res){
  var aboutme = req.body.description;
  var availability = req.body.availability;
  var generalprocess = req.body.generalprocess;
  var price = req.body.price;
  var relooking = req.body.relooking;
  var men = req.body.men;
  var women = req.body.women
  var beaute = req.body.beaute;
  var corses = req.body.corses;
  var creator = req.user.id;
  var relookingtrue = req.body.relookingtrue;
  var beautetrue = req.body.beautetrue;
  var corsestrue = req.body.corsestrue;

  // Function check all info
  var stylistProfile  = new Stylebox({"relookingtrue":relookingtrue, "beautetrue":beautetrue, "corsestrue":corsestrue, "availability": availability, "description": aboutme, "creator": creator, "generalprocess": generalprocess, "price": price, "relooking": relooking, "beaute":beaute, "corses": corses, "valid": false, "men": men, "women": women, "city":"Paris, France"});
  stylistProfile.save(function(err, newStyle){
    if(err){
      console.log(err)
    } else {
      console.log("Profile created with success");
      var creator2 = req.user;
      creator2.styleboxes = newStyle.id;
      creator2.save();
      res.send({"created": true});
    }
  });
})

router.get("/deletestylebox", function(req, res){
  var user = req.user;
  Stylebox.findByIdAndRemove(user.styleboxes, function (err,offer){
    if(err) {
      throw err;
    } else {
      user.styleboxes = "";
      user.save();
      res.send({"ok": true})
    }
  })
})

router.get('/getStylebox', function(req, res){

  if(req.user && req.user.styleboxes){
    Stylebox.getStyleboxById(req.user.styleboxes, function(err, stylebox){
      if(err){
        console.log(err)
      } else {
        res.send({"stylebox":stylebox});
      }
    })
  } else {
    res.redirect("https://www.fason.co");
  }

})

router.get("/updatestylistprofile", function(req, res){
  if(req.user && req.user.styleboxes){
    Stylebox.getStyleboxById(req.user.styleboxes, function(err, stylebox){
      if(err){
        console.log(err)
      } else {
        res.render("updatestylistprofile", {"user":req.user, "stylebox":stylebox});
      }
    })
  } else {
    res.redirect("https://www.fason.co")
  }
});

router.post('/updatestylistprofile', function(req, res){
  var stylebox = req.body.modifiedStylebox;
  var user = req.user;

  Stylebox.getStyleboxById(user.styleboxes, function(err, style){
    if(err){
      console.log(err)
    } else {
      style.description = stylebox.description;
      style.generalprocess = stylebox.generalprocess;
      style.availability = stylebox.availability;
      style.men = stylebox.men;
      style.women = stylebox.women;
      style.relooking = stylebox.relooking;
      style.beaute = stylebox.beaute;
      style.corses = stylebox.corses;
      style.price = stylebox.price;
      style.relookingtrue = stylebox.relookingtrue;
      style.beautetrue = stylebox.beautetrue;
      style.corsestrue = stylebox.corsestrue;
      style.save(function(err){
        if(err){
          console.log(err)
        } else {
          res.send({'updated':true});
        }
      })
    }
  })
})

// Get the conversations and display them when log into inbox page
var conversationsArray = [];
router.get('/inbox', function(req, res){
if(req.user){
  if (req.user.conversations.length == 0) {
    res.render('inbox', {empty: true, "user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  } else if(req.user.conversations.length){
    var promise = new Promise(function (resolve, reject) {
      req.user.conversations.forEach(function(id){
        Conversation.getConversationById(id, function(err, conv){
          if(conv){
            var hasNoReadMessages = false;
            var secondName = "";
            var secondAva = "";
            var promise2 = new Promise(function(resolve, reject){
              if(req.user.id == conv.participants[0]) {
                User.getUserById(conv.participants[1], function(err, user){
                  secondName = user.lastName;
                  secondAva = user.avatar;
                  conv.messages.forEach(function(msg){
                    req.user.notifications.forEach(function(msgNotif){
                      if(msg.id == msgNotif.msgId){
                        hasNoReadMessages = true;
                      }
                    })
                  });
                  resolve({"hasNoRead": hasNoReadMessages, "convName": secondName, "convAva": secondAva});
                });
               } else {
                  User.getUserById(conv.participants[0], function(err, user){
                    secondName = user.lastName;
                    secondAva = user.avatar;
                    conv.messages.forEach(function(msg){
                      req.user.notifications.forEach(function(msgNotif){
                        if(msg.id == msgNotif.msgId){
                          hasNoReadMessages = true;
                        }
                      })
                    });
                    resolve({"hasNoRead": hasNoReadMessages, "convName": secondName, "convAva": secondAva});
                  });
               };
            }).then(function(object){
              conversationsArray.push({"activeTime":new Date( moment(conv.activeTime)), "conv": conv, "convCreatedTime": moment(conv.conversationCreatedTime).format('DD-MM-YYYY, HH:mm'), "hasNoRead": object.hasNoRead, "convName": object.convName, "convAva": object.convAva});
              if(conversationsArray.length == req.user.conversations.length){
                resolve(conversationsArray);
              }
            }).catch(function(err){
              if(err){
                console.log(err);
              }
            })
          }
        });
      });
    }).then(function(object){
      object.sort(function(a,b){
        return moment(b.activeTime) - moment(a.activeTime);
      });

      res.render('inbox', {"convers": object, "user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
      conversationsArray = [];
    }).catch(function(err){
      console.log(err);
    });
  }
} else {
  res.redirect("http://fason.co/");
}
});

router.post('/getmessages', function(req, res){
  if(req.user){
    var conversationId = req.body.conversationId;
    Conversation.getConversationById(conversationId, function(err, conv){
      if(conv.participants[0] == req.user.id){
        User.getUserById(conv.participants[1], function(err, user){
          if(user){
            var convproto = {};
            convproto.messages = [{}];
            convproto.participants = conv.participants;
            convproto.from = conv.from
            convproto.activeTime = conv.activeTime
            convproto.conversationCreatedTime = conv.conversationCreatedTime
            convproto.id = conv.id;
            conv.messages.forEach(function(msg, index, object){
              var newmsg = {};
              newmsg.msg = msg.msg;
              newmsg.msgOwner = msg.msgOwner;
              newmsg.msgOwnerName = msg.msgOwnerName;
              newmsg.messageCreatedTime = msg.messageCreatedTime;
              newmsg.msgTime = moment(msg.messageCreatedTime).format('DD-MM-YYYY, HH:mm');
              convproto.messages.push(newmsg);
              if(index+1  == object.length){
                res.send({"conv": convproto, "avatar": user.avatar, "myAva": req.user.avatar, "userId": req.user.id})
              }
            })
          }
        })
      } else {
        User.getUserById(conv.participants[0], function(err, user){
          if(user){
            var convproto = {};
            convproto.messages = [{}];
            convproto.participants = conv.participants;
            convproto.from = conv.from
            convproto.activeTime = conv.activeTime
            convproto.conversationCreatedTime = conv.conversationCreatedTime
            convproto.id = conv.id;
            conv.messages.forEach(function(msg, index, object){
              var newmsg = {};
              newmsg.msg = msg.msg;
              newmsg.msgOwner = msg.msgOwner;
              newmsg.msgOwnerName = msg.msgOwnerName;
              newmsg.messageCreatedTime = msg.messageCreatedTime;
              newmsg.msgTime = moment(msg.messageCreatedTime).format('DD-MM-YYYY, HH:mm');
              convproto.messages.push(newmsg);
              if(index+1  == object.length){
                res.send({"conv": convproto, "avatar": user.avatar, "myAva": req.user.avatar, "userId": req.user.id})
              }
            })
          }
        })
      }
    });
  } else {
    res.redirect('http://fason.co/');
  }
});

router.get('/getMyInfo', function(req, res){
  if(req.user){
    var avatar = req.user.avatar;
    var lastName = req.user.lastName;
    var now = Date.now();
    var msgTime = moment(now).format('DD-MM-YYYY, HH:mm');
    res.send({"found": true, "avatar": avatar, "firstname": lastName, "time":msgTime});
  } else {
    res.send({"err": "userNotFound"});
  }
});

router.post('/checkIfConvParticipantsActiv', function(req, res){
  if(req.user){
    var convId = req.body.conversationId;
    var participants = req.body.participants;
    var counter = true;
    participants.forEach(function(participant){
      var promise = new Promise(function(resolve, reject){
        User.getUserById(participant, function(err, user){
          if(err){
            console.log(err)
          } else {
            if (user.conversations.length == 0){
              counter = false;
            } else {
              if (user.conversations.indexOf(convId) > -1) {
                counter = true;
              } else {
                counter = false;
              }
            }
          }
          resolve(counter);
        });
      }).then(function(object){
        if(object == false){
          User.getUserById(participant, function(err, user){
            user.conversations.push(convId);
            user.save();
          });
          res.send(true);
        } else {
          res.end();
        }
      }).catch(function(err){
        console.log(err);
      });
    });
  } else {
    res.redirect("http://fason.co/")
  }
});

router.post('/saveMsg', function(req, res){
  if(req.user){
    var conversationId = req.body.conversationId;
  	var messageToSave = req.body.message;
  	if(messageToSave){
      Conversation.getConversationById(conversationId, function(err, conversation){
    		if (err){
    			console.log(err);
          res.send(true);
    		} else {
          var time = moment()
          var promise = new Promise(function(resolve, reject){
            conversation.messages.push({
              msg: messageToSave,
              msgOwner: req.user.id,
              msgOwnerName: req.user.lastName,
              msgOwnerAva: req.user.avatar
            });
            conversation.activeTime = moment();
            var notifiedUser;
              conversation.save(function(err){
        				if(err){
        					console.log(err);
        				}
        			});
              if (conversation.participants[0] == req.user.id){
                notifiedUser = conversation.participants[1]
              } else {
                notifiedUser = conversation.participants[0]
              }
              resolve({"userToNotify": notifiedUser, "messageId": conversation.messages[conversation.messages.length - 1].id});
          }).then(function(object){
            User.getUserById(object.userToNotify, function(err, user){
              if(err){
                console.log(err)
              } else {
                user.notifications.push({"notifMsg": messageToSave, "notifType": "newMsg", "msgId": object.messageId});
                user.save(function(err){
                  if(err){
                    console.log(err);
                  }
                  res.send(true)
                });
              }
            })
          }).catch(function(err){
            console.log(err)
          })
    		}
    	});
    } else {
      res.send(true)
    }
  } else {
    res.redirect('http://fason.co/');
  }
});

// Send the message notification to append new messages ONLY
router.post('/msgNotif', function(req, res){
	if(req.user){
    var promise = new Promise(function(resolve, reject){
  		var msg = req.body.msg;
  		var participants = req.body.participants;
  		var msgOwnerName = req.user.lastName;
      var dataId = req.body.convId;
  		var msgTime = moment().format('DD-MM-YYYY, HH:mm');
  		var obj = {"msg": msg, "msgOwnerName": msgOwnerName, "participants": participants, "avatar": req.user.avatar, "msgTime": msgTime, "dataId": dataId};
  		resolve(obj);
  	}).then(function(object){
      if (object.participants[0] == req.user.id){
        if(object.participants[1]){
          var userToNotify = object.participants[1];
          pusher.trigger(userToNotify, 'new-message', object);
        }
        res.send(true)
      } else {
        if(object.participants[0]){
          var userToNotify2 = object.participants[0];
          pusher.trigger(userToNotify2, 'new-message', object);
        }
        res.send(true)
      }
  	}).catch(function(err){
  		console.log(err);
  	});
  } else {
    res.redirect("http://fason.co/")
  }
});


router.post('/clearNotif', function(req, res){
  if(req.user){
    var convId = req.body.conversationId;
    var user = req.user;
    var promise = new Promise(function(resolve, reject){
      Conversation.getConversationById(convId, function(err, conv){
        conv.messages.forEach(function(message){
          user.notifications.forEach(function(item, index, object){
            if (item.msgId == message.id){
              object.splice(index, 1);
              user.save();
            }
          });
        });
        resolve();
      });
    }).then(function(){
      res.send(true);
    }).catch(function(err){
      console.log(err);
    });
  } else {
    res.redirect("http://fason.co/")
  }
});


router.get('/conv/:id', function(req,res){
if(req.user){
  var user = req.user;
  var convId = req.params.id;
  var found = false;
  req.user.conversations.forEach(function(conver, index, object){
    if (conver == convId){
      found = true
    }
    if(index+1 == object.length){
      if(found){
        Conversation.getConversationById(convId, function(err, conversation){
          var convProto = [{}];
          conversation.messages.forEach(function(msg, indexmsg, objectmsg){
            if(msg.msgOwner == req.user.id.toString()){
              var msgproto = {}
              msgproto.myMsg = true;
              msgproto.msg = msg.msg;
              msgproto.msgOwnerAva = msg.msgOwnerAva;
              msgproto.msgTime = moment(msg.messageCreatedTime).format("DD/MM/YYYY, HH:mm");
              convProto.push(msgproto);
            }
            if(msg.msgOwner != req.user.id.toString()) {
              var msgproto = {};
              msgproto.myMsg = false;
              msgproto.msg = msg.msg;
              msgproto.msgOwnerAva = msg.msgOwnerAva;
              msgproto.msgTime = moment(msg.messageCreatedTime).format("DD/MM/YYYY, HH:mm");
              convProto.push(msgproto);
            }

            if(indexmsg+1 == objectmsg.length){
              res.render('messages', {"user": req.user, "messages": convProto, "convId": convId, "participants": conversation.participants})
            }
          });
        });
      }
    }
  })
} else {
  res.redirect("http://fason.co/")
}

});

router.post('/deleteconversation', function(req, res){
  if(req.user){
    var convId = req.body.convId;
    var user = req.user;
    user.conversations.forEach(function(conversation, index, object){
      if(conversation == convId){
        object.splice(index, 1);
        user.save();
      }
    });
    res.send({ok: true});
  }else {
    res.redirect('http://fason.co/');
  }
});

router.get('/demandes', function(req, res){
  if(req.user){
    var demands = [];
    var reservations = [];
    var mydemands = [];
    var myreservations = [];
    var connectedUser = req.user;

    function updateDemands(callback){
      connectedUser.demandNotifications = [];
      connectedUser.save();
      // Updating demands if expired
      if(connectedUser.demands.length){
        connectedUser.demands.forEach(function(demand, index, object){
          console.log(demand, "THIS IS THE DEMAND")
          Demand.getDemandById(demand, function(err, dem){
            var newDate = moment(dem.createdTime);
            var now = moment();
            var diff = now.diff(newDate, 'hours');
            if(diff >= 24){
              if(dem.approuved == false && dem.declined == false){
                dem.participants.forEach(function(participant, indexparticipant, objectparticipant){
                  User.getUserById(participant, function(err, user){
                    if(user.demands.length){
                      user.demands.forEach(function(deman, indexdem, objectdem){
                        if(deman == dem.id){
                          user.demands.splice(indexdem, 1);
                          user.save();
                          if(req.user.id == user.id){
                            connectedUser = user;
                          };
                        }
                      })
                    }
                    if(user.demandNotifications.length){
                      user.demandNotifications.forEach(function(notif, indexnotif, objectnotif){
                        if(notif.demandid == dem.id){
                          user.demandNotifications.splice(indexnotif, 1);
                          user.save();
                        }
                      })
                    }
                  })
                  if(index+1 == object.length){
                    dem.valid = false;
                    dem.save();
                  }
                })
              }
            }
          })
        })
        setTimeout(function(){
          callback(connectedUser)
        }, 1000)
      } else {
        callback(connectedUser);
      }
    }

      updateDemands(function(connectedUser){
        if(connectedUser.demands.length){
          connectedUser.demands.forEach(function(demand, index3, object3){
            Demand.getDemandById(demand, function(err, dem){
              if(err){
                console.log(err)
              }

              if(dem){
                User.getUserById(dem.creator, function(err, user){
                  if(err){
                    console.log(err)
                  } else {
                    var time = dem.time;
                    var now = moment();
                    var newDate = moment(dem.createdTime);
                    var diff = now.diff(newDate, 'hours');
                    var expiretime = 24 - diff;
                    dem.formatedtime = moment(time).format("DD/MM/YYYY");
                    dem.formatedtimeHours = moment(time).format("HH:mm");
                    if(expiretime != 0){
                      dem.diff = expiretime;
                    }
                    var created = dem.createdTime;
                    dem.formatedcreatedTime = moment(created).format("DD/MM/YYYY, HH:mm");
                    dem.participants.forEach(function(userava, indexuserava, objectuserava){
                      User.getUserById(userava, function(err, userav){
                        if(dem.creator.toString() != req.user.id.toString()){
                          if(dem.creator.toString() == userava.toString()){
                            dem.demava = userav.avatar;
                            dem.creatorName = userav.lastName;
                          }
                        } else {
                          if(dem.creator.toString() != userava.toString()){
                            dem.demava = userav.avatar;
                            dem.creatorName = userav.lastName;
                          }
                        }
                      })
                      if(indexuserava+1 == objectuserava.length){
                        if(dem.creator.toString() != req.user.id.toString()){
                          if(dem.declined == false && dem.approuved == false){
                            demands.push(dem);
                          }

                          if(dem.approuved == true && moment(dem.time) > moment()){
                            reservations.push(dem);
                          }
                        } else {
                          if(dem.declined == false && dem.approuved == false){
                            mydemands.push(dem);
                          }
                          if(dem.approuved == true && moment(dem.time) > moment()){
                            myreservations.push(dem);
                          }
                        }
                      }
                    })

                    if((index3+1).toString() == (connectedUser.demands.length).toString()){
                      setTimeout(function(){
                        if(demands.length || reservations.length || mydemands.length || myreservations.length){
                          res.render('demandes',
                          {"user": connectedUser,
                          "demands": demands,
                          "reservations": reservations,
                          "mydemands": mydemands,
                          "myreservations": myreservations,
                          "newmessages": connectedUser.notifications.length,
                          "newdemands": connectedUser.demandNotifications.length,
                          "allNotifications": connectedUser.demandNotifications.length + connectedUser.notifications.length});
                        } else {
                          res.render('demandes',
                          {"user": req.user,
                          "err":"Vous n'avez aucune demande de relooking pour le moment.",
                          "newmessages": connectedUser.notifications.length,
                          "newdemands": connectedUser.demandNotifications.length,
                          "allNotifications": connectedUser.demandNotifications.length + connectedUser.notifications.length});
                        }
                      }, 1000)
                    }
                  }
                })
              }
            })
          })
        } else {
          res.render('demandes', {"user": req.user, "err":"Vous n'avez aucune demande de relooking pour le moment.", "newmessages": connectedUser.notifications.length, "newdemands": connectedUser.demandNotifications.length, "allNotifications": connectedUser.demandNotifications.length + connectedUser.notifications.length});
        }
      })
  } else {
    res.redirect('http://fason.co/');
  }
})


router.post('/acceptdemand', function(req, res){
  if(req.user){
    var demandId = req.body.demandId;
    Demand.getDemandById(demandId, function(err, demand){
      var time = demand.time;
      var appoinementTime = moment(time).format("DD/MM/YYYY, HH:mm");
      if(moment(time) > moment()){
        demand.approuved = true;
        demand.valid = false;
        demand.save();
        var creatorId = demand.creator.toString();

        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

        var newEval = new Eval();
        newEval.startDate = demand.time;
        newEval.endDate = addDays(demand.time, 14);
        newEval.stylistId = req.user.id;
        newEval.forDemand = demand.id;
        newEval.clientId = demand.creator;
        newEval.forStylebox = demand.forStylebox;
        Eval.createNewEval(newEval, function(err, newEva){
          User.getUserById(demand.creator, function(err, client){
            client.evals.push(newEva.id);
            client.demandNotifications.push({"demandid":demand.id});
            client.save();
          })
        })
        var user2 = req.user;
        user2.demandNotifications.forEach(function(notif, index, object){
          if(notif.demandid == demand.id){
            object.splice(index, 1);
            user2.save();
          }
        })

        var mailOptions = {
            from: '"Fason service client" <fason.contact@gmail.com>', // sender address
            to: "fason.contact@gmal.com", // list of receivers
            subject : "Dem accepted bro",
            html : "Demande accépté <br><br> id : "+ demand.id
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
        });

        pusher.trigger(creatorId, 'demands', {"demandAccepter": true});
        res.send({"status": true, "appoinementTime": appoinementTime});
      } else {
        var userst = req.user;
        demand.declined = true;
        demand.valid = false;
        demand.save();

        if(userst.demands.length){
          userst.demands.forEach(function(deman, indexdeman, objectdeman){
            if(deman.toString() == demand.id.toString()){
              userst.demands.splice(indexdeman, 1);
              userst.save();
            }
          })
        }

        if(userst.demandNotifications.length){
          userst.demandNotifications.forEach(function(demanN, indexdemanN, objectdemanN){
            if(demanN.demandid.toString() == demand.id.toString()){
              userst.demandNotifications.splice(indexdemanN, 1);
              userst.save();
            }
          })
        }

        User.getUserById(demand.creator, function(err, clientS){
          if(err){
            console.log(err)
          } else {
            if(clientS.demands.length){
              clientS.demands.forEach(function(demcl, indexcl, objectcl){
                if(demcl.toString() == demand.id.toString()){
                  clientS.demands.splice(indexcl, 1);
                  clientS.save();
                }
              })
            }

            if(clientS.demandNotifications.length){
              clientS.demandNotifications.forEach(function(demclN, indexclN, objectclN){
                if(demclN.demandid.toString() == demand.id.toString()){
                  clientS.demandNotifications.splice(indexclN, 1);
                  clientS.save();
                }
              })
            }
          }
        })
        res.send({"expired":true})
      }
    })
  } else {
    res.redirect('http://fason.co/');
  }
});

router.post('/declinedemand', function(req, res){
  if(req.user){
    var demandId = req.body.demandId;
    Demand.getDemandById(demandId, function(err, dem){
      dem.valid = false;
      dem.save();
      User.getUserById(dem.creator, function(err, user){
        user.demandNotifications.forEach(function(notif, index, object){
          if(notif.demandid == dem.id){
            object.splice(index, 1);
            user.save();
          }
        });
        user.demands.forEach(function(demand, index2, object2){
          if(demand == dem.id){
            object2.splice(index2, 1);
            user.save();
          }
        });

        client.sms.messages.create({
          to:user.phone,
          from:'+33644607659',
          body:'FASON : Votre dernière demande de relooking a été déclinée. Vous pouvez désormais en refaire une autre.',
        }, function(err, message) {
          if(err){
            console.log(err);
          }
        })
      })
    })
    res.send(true);
  } else {
    res.redirect('http://fason.co/');
  }
});

router.get('/checkevals', function(req, res){
  if(req.user){
    var user = req.user;
    var count = 0;
    if(user.evals.length){
      user.evals.forEach(function(eval, index, object){
        Eval.getEvalById(eval, function(err, evalu){
          if(err){
            console.log(err)
          }

          if(evalu){
            if(evalu.stylistId == req.user.id){
              if(evalu.stylistCommented){
                if(index+1  == object.length){
                  if(count){
                    res.send({"evals": count, "send": true});
                  } else {
                    res.send({"noeffect": true})
                  }
                }
              } else {
                if(moment(evalu.startDate) < moment() && moment(evalu.endDate) > moment()){
                  count = count+1;
                  if(index+1  == object.length){
                    res.send({"evals": count, "send": true});
                  }
                } else {
                  if(index+1 == object.length){
                    if(count){
                      res.send({"evals": count, "send": true});
                    } else {
                      res.send({"noeffect": true})
                    }
                  }
                }
              }
            } else {
              if(evalu.clientCommented){
                if(index+1 == object.length){
                  if(count){
                    res.send({"evals": count, "send": true});
                  } else {
                    res.send({"noeffect": true})
                  }
                }
              } else {
                if(moment(evalu.startDate) < moment() && moment(evalu.endDate) > moment()){
                  count = count+1;
                  if(index+1 == object.length){
                    res.send({"evals": count, "send": true});
                  }
                } else {
                  if(index+1 == object.length){
                    if(count){
                      res.send({"evals": count, "send": true});
                    } else {
                      res.send({"noeffect": true})
                    }
                  }
                }
              }
            }
          } else {
            if(index+1 == object.length){
              if(count){
                res.send({"evals": count, "send": true});
              } else {
                res.send({"noeffect": true})
              }
            }
          }
        })
      })
    } else {
      res.send({"noeffect": true})
    }
  } else {
    res.send({"noeffect": true})
  }
});

router.get('/evaluate', function(req, res){
  if(req.user){
    var connectedUser = req.user;
    var evalsArray = [];
    connectedUser.evals.forEach(function(evall, index, object){
      Eval.getEvalById(evall, function(err, eval){
        if(moment(eval.startDate) < moment() && moment(eval.endDate) > moment()){
          var evalProto = {};
          function getevalinfo(callback){
            evalProto.evalId = eval.id;
            User.getUserById(eval.stylistId, function(err, user){
              if(user){
                evalProto.stylistId = eval.stylistId;
                evalProto.styleboxId = eval.forStylebox;
                console.log(eval.forStylebox,eval.forStylebox,eval.forStylebox,eval.forStylebox,eval.forStylebox)
                evalProto.stylistAvatar = user.avatar;
                evalProto.stylistName = user.lastName;
                Demand.getDemandById(eval.forDemand, function(err, demand){
                  if(demand){
                    evalProto.makeover = moment(demand.time).format('DD-MM-YYYY, HH:mm');
                    callback();
                  } else {
                    evalProto.problem = true;
                    callback();
                  }
                })
              } else {
                evalProto.problem = true;
                Demand.getDemandById(eval.forDemand, function(err, demand){
                  if(demand){
                    evalProto.makeover = moment(demand.time).format('DD-MM-YYYY, HH:mm');
                    callback();
                  } else {
                    evalProto.problem = true;
                    callback();
                  }
                })
              }
            });
          }

          getevalinfo(function(){
            function laststade(callback2){
              if(evalProto.problem){
                object.splice(index, 1);
                connectedUser.save();
                callback2();
              } else {
                evalsArray.push(evalProto);
                callback2();
              }
            }
            laststade(function(){
              res.render('evaluate', {"evalsArray": evalsArray, "user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
            })
          });
        }
      })
    });
  } else {
    res.redirect('http://fason.co/');
  }
})

router.post('/evaluate', function(req, res){
  if(req.user){
    var styleboxId = req.body.styleboxId;
    var evalId = req.body.evalId;
    var userId = req.body.userId;
    var communication = req.body.communication;
    var precision = req.body.precision;
    var quality = req.body.quality;
    var ponctuality = req.body.ponctuality;
    var comment = req.body.comment;
    var currentuser = req.user;
    var demand = {};
    var evaluation = {};
    console.log(styleboxId, evalId, "THIS INFOOOS");
    function getallneededinfos(callback){
      currentuser.demands.forEach(function(dem, index, obj){
        if(dem.forStylebox == styleboxId){
            demand = dem;
        }
        if(index+1 == obj.length){
          Eval.getEvalById(evalId, function(err, eval){
            evaluation = eval;
            eval.clientCommented = true;
            eval.save();
            callback();
          })
        }
      });
    }

    getallneededinfos(function(){
      // var showDate = moment(evaluation.createdTime, "DD-MM-YYYY").add(14, 'days');
      var commentObj = {"creator":req.user, "creatorAva": req.user.avatar, "creatorName": req.user.lastName, "stylebox":styleboxId, "commentBody":comment, "showDate":evaluation.endDate};
      var evalObj = {"precision":precision, "qualityprice":quality, "ponctuality":ponctuality, "communication":communication}
      Comments.createNewComment(commentObj, function(err, comment){
        if(err){
          console.log(err)
        }
        Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
          console.log(stylebox)
          stylebox.comments.push(comment.id);
          stylebox.rating.push(evalObj);
          stylebox.save(function(){
            currentuser.evals.forEach(function(eval, index, obj){
              if(eval == evalId){
                currentuser.evals.splice(index, 1);
                currentuser.save();
                res.send(true);
              }
            })
          });
        })
      })
    })
  } else {
    res.redirect('http://fason.co/');
  }
})

router.get('/team', function(req, res){
  if(req.user){
    res.render('team', {"user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  } else {
    res.render('team');
  }
})

router.get('/apropos', function(req, res){
  if(req.user){
    res.render('apropos', {"user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  } else {
    res.render('apropos');
  }
})

router.get('/contacter', function(req, res){
  if(req.user){
    res.render('contacter', {"user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  } else {
    res.render('contacter');
  }
})

router.post('/contacter', function(req, res){
  if(req.user){
    var message = req.body.messagemail;
    var mailOptions = {
        from: '"Fason service client" <fason.contact@gmail.com>', // sender address
        to: "fason.contact@gmail.com", //
        subject : "Nouveau message d'un membre !",
        html : "message from: "+ req.user.email + "</br>"+ " message: "+ message
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        } else {
          res.redirect("http://fason.co/");
        }
    });
  } else {
    var message = req.body.messagemail;
    var fromemail = req.body.messageemailadress;
    var objet = req.body.objet;
    var mailOptions = {
        from: '"Fason service client" <fason.contact@gmail.com>', // sender address
        to: "fason.contact@gmail.com", //
        subject : "Nouveau message d'un membre !",
        html : "message from: "+ fromemail + "</br>"+ "objet: "+objet +"</br>"+" message: "+ message
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        } else {
          res.redirect("http://fason.co/");
        }
    });
  }
})

router.get('/conditions', function(req, res){
  if(req.user){
    res.render('conditions', {"user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  } else {
    res.render('conditions');
  }
})

router.get('/login', function(req, res){
  if(req.user){
    res.redirect("http://fason.co")
  } else {
    res.render('login');
  }
})

router.get('/register', function(req, res){
  if(req.user){
    res.redirect("http://fason.co")
  } else {
    res.render('register');
  }
})

router.get('/searchxs', function(req, res){
  res.render('searchxs');
})

router.get('/resetPassword/:id', function(req, res){
  if(req.user){
    res.redirect("http://fason.co")
  } else {
    var id = req.params.id;
    res.render('reset', {"token":id});
  }

});

router.get('/canidagyoxaryac', function(req, res){
  if(req.user){
    if(req.user.email == "nohchi.eu@gmail.com"){
      res.render('canixuardac');
    } else {
      res.redirect("https://fason.co/");
    }
  } else {
    res.redirect("https://fason.co/");
  }
})

router.post('/dayahit', function(req, res){
  if(req.user){
    if(req.user.email == "nohchi.eu@gmail.com"){
      var methodtype = req.body.methodtype;
      var subject = req.body.subject;
      var message = req.body.message;
      if(methodtype){
        if(methodtype == "everybody"){
          User.find({}, function(err, users){
            users.forEach(function(user, index, object){
              var mailOptions = {
                  from: '"Fason service client" <fason.contact@gmail.com>', // sender address
                  to: user.email, // list of receivers
                  subject : req.body.subject,
                  html : req.body.message
              };
              transporter.sendMail(mailOptions, function(error, info){
                  if(error){
                      return console.log(error);
                  }
              });
              if(index+1 == object.length){
                res.send({"complete": true})
              }
            });
          });
        }
      }
    } else {
      res.redirect("https://fason.co/");
    }
  } else {
    res.redirect("https://fason.co/");
  }
});

router.get('/canidagyoxaryac', function(req, res){
  if(req.user){
    if(req.user.email == "nohchi.eu@gmail.com" || "ma_darvin@hotmail.fr"){
      res.render('canixuardac');
    } else {
      res.redirect("https://fason.co/");
    }
  } else {
    res.redirect("https://fason.co/");
  }
})

router.post('/dayahit', function(req, res){
  if(req.user){
    if(req.user.email == "nohchi.eu@gmail.com" || "ma_darvin@hotmail.fr"){
      var methodtype = req.body.methodtype;
      var subject = req.body.subject;
      var message = req.body.message;
      if(methodtype){
        if(methodtype == "everybody"){
          User.find({styleboxes: {$exists: true, $ne: null }}, function(err, users){
            users.forEach(function(user, index, object){
              var mailOptions = {
                  from: '"Fason service client" <fason.contact@gmail.com>', // sender address
                  to: user.email, // list of receivers
                  subject : req.body.subject,
                  html : req.body.message
              };
              transporter.sendMail(mailOptions, function(error, info){
                  if(error){
                      return console.log(error);
                  }
              });
              if(index+1 == object.length){
                res.send({"complete": true})
              }
            });
          });
        }
      }
    } else {
      res.redirect("https://fason.co/");
    }
  } else {
    res.redirect("https://fason.co/");
  }
});

module.exports = router;
