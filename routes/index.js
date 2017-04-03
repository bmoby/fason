var express = require('express');
var router = express.Router();
var Conversation = require('../models/conversation');
var Promise = require('promise');
var Pusher = require('pusher');
var User = require('../models/user');
var moment = require('moment');
var Stylebox = require('../models/stylebox');
var Comments = require('../models/comment');
var aggregate = Stylebox.aggregate();
var Demand = require('../models/demand');
var nodemailer = require('nodemailer');
var twilio = require('twilio');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var AWS = require('aws-sdk');
var client = new twilio.RestClient('AC0f6433c5d0713b85184d77e30383fd4f', 'cbac6157842210b60de45dab4f90f9fa');


// Params setting for pusher -> REAL TIME NOTIFICATIONS SYSTEM
var pusher = new Pusher({
  appId: '283453',
  key: '095ff3028ab7bceb6073',
  secret: '25077850beef8ae1d148',
  encrypted: true
});

// Params setting nodemailer transporter
var transporter = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "fason.contact@gmail.com",
        pass: "bianor19871989"
    }
});

/* GET home page. */
router.get('/', function(req, res) {
  if(req.user){
    res.render('index', {"user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  } else {
    res.render('index');
  }
});


// SEARCH PAGES


router.get('/search', function(req, res){
  if(req.user){
    res.render('search', {"user": req.user, "newmessages": req.user.notifications.length, "errmsg": "Veuillez entrer vos criteres de recherche, ou appuyez sur Recherche", "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  } else {
    res.render('search', {"user": req.user, "errmsg": "Veuillez entrer vos criteres de recherche ou appuyez sur Recherche."});
  }
})

router.post('/search', function(req, res){
  var city = req.body.city;
  var gender = req.body.gender;
  var style = req.body.style;

  var promise = new Promise(function(resolve, reject){
    var options = {};
    if(city){
      options.city = { "$regex": city, "$options": "i" };
    }
    if(gender != 'Homme & Femme'){
      options.gender = gender;
    }

    if(style == "vestimentaire"){
      options.vestimentaire = true;
      options.beaute = false;
    } else if(style == "beaute"){
      options.vestimentaire = false;
      options.beaute = true;
    }

    resolve(options);
  }).then(function(obje){
    Stylebox.find(obje, function(err, styleboxes){
      if (err){
        res.send("Une erreur s'est produite, veuillez essayer plus tard")
      } else {
        // Send gender info to autocomplete fields after the search
        var mens = false;
        var womans = false;
        if (obje.gender == "men"){
          mens = true;
        }
        if (obje.gender == "ladies"){
          womans = true;
        }


        var cityResend = req.body.city;

        // Send style info to autocomplete fields after the search
        var styleObj = {
          vestimentaire: false,
          beaute: false,
        }

        switch(obje.style) {
            case "vestimentaire":
                styleObj.vestimentaire = true;
                break;
            case "beaute":
                styleObj.beaute = true;
                break;
            default:
                 break;
        }

        var styleboxesandstylist = [];
        if(styleboxes.length != 0){
          styleboxes.forEach(function(stylebox, index, object){
            User.getUserById(stylebox.creator, function(err, user){
              var rating = {};
              var general = 0;
              var communication = 0;
              var quality = 0;
              var ponctuality = 0;
              var precision = 0;
              if(user.rating.length){
                user.rating.forEach(function(rat, index2, object2){
                  communication = communication + rat.communication;
                  quality = quality + rat.qualityprice;
                  ponctuality = ponctuality + rat.ponctuality;
                  precision = precision + rat.precision;

                  if(index2+1 == user.rating.length){
                    var styleboxproto = stylebox;
                    rating.general = (quality+communication+ponctuality+precision)/(user.rating.length * 4);
                    rating.number = user.rating.length;
                    styleboxproto.rating = rating;
                    //separator
                    styleboxproto.stylistname = user.lastName;
                    styleboxproto.stylistavatar = user.avatar;
                    styleboxesandstylist.push(styleboxproto);
                    if(index + 1 == object.length){
                      if(req.user){
                        res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user, "newmessages": req.user.notifications.length, "options": obje, "cityResend": cityResend, "men": mens, "ladies": womans, "styleObj": styleObj, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
                      } else {
                        res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user, "options": obje, "cityResend": cityResend, "men": mens, "ladies": womans, "styleObj": styleObj});
                      }
                    }
                  }
                });
              } else {
                var styleboxproto = stylebox;
                rating.general = -1;
                rating.number = 0;
                styleboxproto.rating = rating;
                //separator
                styleboxproto.stylistname = user.lastName;
                styleboxproto.stylistavatar = user.avatar;
                styleboxesandstylist.push(styleboxproto);
                if(index + 1 == object.length){
                  if(req.user){
                    res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user, "newmessages": req.user.notifications.length, "options": obje, "cityResend": cityResend, "men": mens, "ladies": womans, "styleObj": styleObj, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
                  } else {
                    res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user, "options": obje, "cityResend": cityResend, "men": mens, "ladies": womans, "styleObj": styleObj});
                  }
                }
              }
            });
          })
        } else {
          if(req.user){
            res.render('search', {"user": req.user, "newmessages": req.user.notifications.length, "errmsg": "Aucun style ne correspond à votre recherche", "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
          } else {
            res.render('search', {"user": req.user, "errmsg": "Aucun style ne correspond à votre recherche"});
          }
        }
      }
    })
  }).catch(function(err){
    console.log(err);
  })
});

router.get('/stylebox/:id', function(req, res){
  var commentList = [];
  var styleboxId = req.params.id;
  Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
    if(stylebox.comments){
      stylebox.comments.forEach(function(comment, indexcom, objectcom){
        Comments.getCommentById(comment, function(err, com){
          if(err){
            console.log(err)
          } else {
            if(moment(com.showDate) < moment()){
              var formatedCreated = moment(com.createdTime).format('DD-MM-YYYY, hh:mm:ss');
              com.createdDate = formatedCreated;
              commentList.push(com);
            }
          }
        })
      })
    }
    User.getUserById(stylebox.creator, function(err, user){
      if(err){
        console.log(err)
      } else {
        var gender = "";
        var style = "";
        if (stylebox.gender == "ladies"){
          gender = "femme"
        } else {
          gender = "homme"
        }

        switch(stylebox.style) {
          case "casual":
            style = "Casual";
          break;
          case "businesscasual":
            style = "Business casual";
          break;
          case "businessformal":
            style = "Business formal";
          break;
          case "business":
            style = "Business";
          break;
          case "CocktailChic":
            style = "Cocktail chic";
          break;
          case "SemiFormal":
            style = "Semi-formal";
          break;
          case "BlackTie":
            style = "Black tie";
          break;
          case "WhiteTie":
            style = "White tie";
          break;
          case "Bohemian":
            style = "Bohemian";
          break;
          case "Arty":
            style = "Arty";
          break;
          case "Chic":
            style = "Chic";
          break;
          case "Classic":
            style = "Classic";
          break;
          case "Exotic":
            style = "Exotic";
          break;
          case "Flamboyant":
            style = "Flamboyant";
          break;
          case "Sophisticated":
            style = "Sophisticated";
          break;
          case "Sexy":
            style = "Sexy";
          break;
          case "Western":
            style = "Western";
          break;
          case "Traditional":
            style = "Traditional";
          break;
          case "Preppy":
            style = "Preppy";
          break;
          case "Punk":
            style = "Punk";
          break;
          case "Tomboy":
            style = "Tomboy";
          break;
          case "Rocker":
            style = "Rocker";
          break;
          case "Goth":
            style = "Goth";
          break;
          case "Coiffure":
            style = "Coiffure";
          break;
          case "Barbe":
            style = "Tailler la barbe";
          break;
          case "CoiffureColoration":
            style = "Coiffure et coloration";
          break;
          case "CoiffureBarbe":
            style = "Coiffure et tailler la barbe";
          break;
          case "CoiffureColorationBarbe":
            style = "Coiffure, coloration et tailler la barbe";
          break;
          case "Maquillage":
            style = "Maquillage";
          break;
          case "Manucure":
            style = "Manucure";
          break;
          case "Pedicure":
            style = "Pédicure";
          break;
          case "ManucurePedicure":
            style = "Manucure et pédicure";
          break;
          case "Sourcils":
            style = "Sourcils";
          break;
          case "SoinVisage":
            style = "Soin visage";
          break;
          case "SoinCorp":
            style = "Soin corps";
          break;
          case "SoinVisageCorp":
            style = "Soin visage et corps";
          break;
          default:
               break;
        }

        var haveToVerify = false;
        if(req.user){
          if(req.user.varified == false || req.user.phoneIsVerified == false){
            haveToVerify = true;
          }
        }
        var stylistNeededInfo = {"firstName": user.firstName, "lastName": user.lastName, "avatar": user.avatar, "description": user.stylist.description, "availability": user.stylist.availability};
        var rating = {};
        var general = 0;
        var communication = 0;
        var quality = 0;
        var ponctuality = 0;
        var precision = 0;
        if(user.rating.length){
          user.rating.forEach(function(rat, index, object){
            communication = communication + rat.communication;
            quality = quality + rat.qualityprice;
            ponctuality = ponctuality + rat.ponctuality;
            precision = precision + rat.precision;

            if(index+1 == user.rating.length){
              rating.quality = quality/user.rating.length;
              rating.communication = communication/user.rating.length;
              rating.ponctuality = ponctuality/user.rating.length;
              rating.precision = precision/user.rating.length;
              rating.general = (quality+communication+ponctuality+precision)/(user.rating.length * 4);
              rating.number = user.rating.length;
              if(req.user){
                res.render('stylebox-display', {"styleboxcomments": commentList, "stylebox": stylebox,"rating": rating, "stylist": stylistNeededInfo,  "gender": gender, "style": style, user: req.user, "newmessages": req.user.notifications.length, "haveToVerify": haveToVerify, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
              } else {
                res.render('stylebox-display', {"styleboxcomments": commentList, "stylebox": stylebox, "rating": rating, "stylist": stylistNeededInfo,  "style": style, "gender": gender, user: req.user, "haveToVerify": haveToVerify});
              }
            }
          });
        } else {
          rating.quality = -1;
          rating.communication = -1;
          rating.ponctuality = -1;
          rating.precision = -1;
          rating.general = -1;
          rating.number = 0;
          if(req.user){
            res.render('stylebox-display', {"styleboxcomments": commentList, "stylebox": stylebox,"rating": rating, "stylist": stylistNeededInfo,  "style": style, "gender": gender, user: req.user, "newmessages": req.user.notifications.length, "haveToVerify": haveToVerify, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
          } else {
            res.render('stylebox-display', {"styleboxcomments": commentList, "stylebox": stylebox, "rating": rating, "stylist": stylistNeededInfo,  "style": style, "gender": gender, user: req.user, "haveToVerify": haveToVerify});
          }
        }
      }
    })
  });
});


router.post('/demand', function(req, res){
  var date = req.body.date;
  var styleboxId = req.body.styleboxId;
  var creator = req.user.id;
  // Setting the date
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
      // Updating demands if expired
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
                        if(req.user.id == user.id){
                          connectedUser = user;
                        };
                      }
                    })
                  }
                  if(user.evals.length){
                    user.evals.forEach(function(eval, indexeval, objecteval){
                      if(eval.fordemand == dem.id){
                        user.evals.splice(indexeval, 1);
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
            callback(connectedUser)
          }
        })
      })
    }
  }).then(function(){
    Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
      var validDemand = false;
      if(req.user.demands.length == 0){
        // Creating a prototype of the demand
        var newDemand = {
          creator: creator,
          participants:[creator, stylebox.creator],
          time: demandTime,
          creatorName: req.user.firstName +" "+req.user.lastName,
          forstyle: req.body.forstyle

        }

        Demand.createNewDemand(newDemand, function(err, savedDemand){
          if(err){
            console.log(err)
          } else {
            var comDate = moment(savedDemand.time, "DD-MM-YYYY").add(14, 'days');
            var demand = {
              type: "recu",
              client: req.user.firstName,
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
                pusher.trigger(user.id, 'demands', demand);
                res.send({"ok": true})
              }
            });
            User.getUserById(stylebox.creator, function(err, user){
              client.sms.messages.create({
                to:user.phone,
                from:'+33644607659',
                body:'FASON: Vous avez reçu une nouvelle demande de relooking.',
              }, function(err, message) {
                if(err){
                  console.log(err);
                }
              })
            })
          }

          savedDemand.participants.forEach(function(participant, indexx, objectt){
            function addDays(date, days) {
                var result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            };
            var startDate = savedDemand.time;
            if(participant.toString() == savedDemand.creator.toString()){
              if(indexx == 0){
                User.getUserById(participant, function(err, user){
                  if(err){
                    console.log(err)
                  } else {
                    var eval = {"startDate": startDate, "endDate": addDays(startDate, 14), "forstylebox" : stylebox.id, "fordemand": savedDemand.id, "stylistId":savedDemand.participants[1] };
                    user.evals.push(eval);
                    user.save();
                  }
                })
              } else {
                User.getUserById(participant, function(err, user){
                  if(err){
                    console.log(err)
                  } else {
                    var eval = {"startDate": startDate, "endDate": addDays(startDate, 14), "forstylebox" : stylebox.id, "fordemand": savedDemand.id, "stylistId":savedDemand.participants[0] };
                    user.evals.push(eval);
                    user.save();
                  }
                })
              }
            }

            if(participant.toString() != savedDemand.creator.toString()){
              if(indexx == 0){
                User.getUserById(participant, function(err, user){
                  if(err){
                    console.log(err)
                  } else {
                    var eval = {"startDate": startDate, "endDate": addDays(startDate, 14), "forstylebox" : stylebox.id, "fordemand": savedDemand.id, "userId": savedDemand.participants[1] };
                    user.evals.push(eval);
                    user.save();
                  }
                })
              } else {
                User.getUserById(participant, function(err, user){
                  if(err){
                    console.log(err)
                  } else {
                    var eval = {"startDate": startDate, "endDate": addDays(startDate, 14), "forstylebox" : stylebox.id, "fordemand": savedDemand.id, "userId": savedDemand.participants[0] };
                    user.evals.push(eval);
                    user.save();
                  }
                })
              }
            }
          });
        })
      } else {
        req.user.demands.forEach(function(demId, index){
          Demand.getDemandById(demId, function(err, dem){
            if(dem.valid == true){
              validDemand = true;
            }
            if(index + 1 == req.user.demands.length){
              if (validDemand){
                res.send({"err":"Vous avez une demande en cours..."})
              } else {
                // Creating a prototype of the demand
                var newDemand = {
                  creator: creator,
                  participants:[creator, stylebox.creator],
                  time: demandTime
                }

                Demand.createNewDemand(newDemand, function(err, savedDemand){
                  if(err){
                    console.log(err)
                  } else {
                    var comDate = moment(savedDemand.time, "DD-MM-YYYY").add(14, 'days');
                    var demand = {
                      type: "recu",
                      client: req.user.firstName,
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
                          body:'FASON: Vous avez reçu une nouvelle demande de relooking.',
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
                  }
                })
              }
            }
          })
        })
      }
    })
  })
});

router.get('/sendPhoneCode', function(req, res){
  var code = req.user.phoneVerification;
  client.sms.messages.create({
    to:req.user.phone,
    from:'+33644607659',
    body:'Votre code FASON:'+ code,
  }, function(error, message) {
    if (!error) {
        res.send({"smsSent": true})
    } else {
        console.log(error);
    }
  });
});

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
      res.send(false);
    }
  } else {
    res.send(false);
  }
});


router.get('/sendEmailVerify', function(req, res){
  var link = "https://fason.herokuapp.com/users/verify?id="+req.user.verifyEmailString;
  var mailOptions = {
      from: '"Fason service client" <fason.contact@gmail.com>', // sender address
      to: req.user.email, // list of receivers
      subject : "Veuillez confirmer votre email",
      html : "Bonjour,<br> Cliquez sur ce lien afin de confirmer votre email.<br><a href="+link+">lien de confirmation</a>"
  };
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      } else {
        res.send({"userId": req.user.id});
      }
  });
});

router.post('/verifyMyPhone', function(req, res){
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
});

router.get('/currentUser', function(req, res){
  if(req.user){
    res.send({'userId': req.user.id})
  } else {
    res.send("no user connected")
  }
})

// Send a demand router

router.get('/createstylebox', function(req, res){
  if(req.user){
    if(req.user.stylist.status){
      res.render('createstylebox', {user: req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
    } else {
      res.render('become-stylist', {user: req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
    }
  } else {
    res.redirect('https://fason.herokuapp.com/');
  }
})


AWS.config = {
  accessKeyId: 'AKIAJ5ZF3LOCVCPMJ5LQ',
  secretAccessKey: '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'
}
var s3 = new AWS.S3();

var uploadMulter = multer({dest: 'public/img'})
var dbPic = [];

router.post('/load', uploadMulter.single('input44[]') , function(req, res, next){
  var fileName = {};
  var file = req.file;
  var stream = fs.createReadStream(file.path)
  var imageType = file.mimetype.split('/').pop()
  fileName = file.filename+'.'+imageType;
  // Global array of pics
  dbPic.push(fileName);

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
      res.send(true);
    }
  });
});

router.post('/createstylebox', function(req, res){
  var budget = req.body.budget;
  var title = req.body.title;
  var price = req.body.price;
  var styleObject = req.body.styleObject;
  var gender = req.body.gender;
  var minTime = req.body.minTime;
  var city  = req.body.city;
  var description = req.body.description;

  function checkcity(citytest){
    if(citytest != ""){
      return citytest
    } else {
      return req.user.city;
    }
  }

  var newStyle = new Stylebox({
    creator: req.user,
    title: title,
    price:price,
    vestimentaire: styleObject.vestimentaire,
    beaute: styleObject.beaute,
    style:styleObject.style,
    gender: gender,
    minTime: minTime,
    city: checkcity(city),
    minBudget: budget,
    description: description,
    photos: dbPic,
  });

  Stylebox.createNewStylebox(newStyle, function(err, stylebox){
    if(err) {
      console.log(err)
    } else {
      dbPic=[];
      res.send(true);
    }
  });
});

// Get the conversations and display them when log into inbox page
var conversationsArray = [];
router.get('/inbox', function(req, res){
  if (req.user && req.user.conversations.length == 0) {
    res.render('inbox', {empty: true, "user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  } else {
    var promise = new Promise(function (resolve, reject) {
      req.user.conversations.forEach(function(id){
        Conversation.getConversationById(id, function(err, conv){
          if (conv){
            var hasNoReadMessages = false;
            var secondName = "";
            var secondAva = "";
            var promise2 = new Promise(function(resolve, reject){
              if(req.user.id == conv.participants[0]) {
                User.getUserById(conv.participants[1], function(err, user){
                  secondName = user.firstName;
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
                    secondName = user.firstName;
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
              conversationsArray.push({"activeTime":new Date( moment(conv.activeTime)), "conv": conv, "convCreatedTime": moment(conv.conversationCreatedTime).format('DD-MM-YYYY, hh:mm:ss'), "hasNoRead": object.hasNoRead, "convName": object.convName, "convAva": object.convAva});
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

      res.render('inbox', {"convers": object, "user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length });
      conversationsArray = [];
    }).catch(function(err){
      console.log(err);
    });
  }
});

router.post('/getmessages', function(req, res){

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
            newmsg.msgTime = moment(msg.messageCreatedTime).format('DD-MM-YYYY, hh:mm:ss');
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
            newmsg.msgTime = moment(msg.messageCreatedTime).format('DD-MM-YYYY, hh:mm:ss');
            convproto.messages.push(newmsg);
            if(index+1  == object.length){
              res.send({"conv": convproto, "avatar": user.avatar, "myAva": req.user.avatar, "userId": req.user.id})
            }
          })
        }
      })
    }
  });
});


router.get('/getMyInfo', function(req, res){
  var avatar = req.user.avatar;
  var firstName = req.user.firstName;
  var now = Date.now();
  var msgTime = moment(now).format('DD-MM-YYYY, hh:mm:ss');
  res.send({"avatar": avatar, "firstname": firstName, "time":msgTime});
});

router.post('/checkIfConvParticipantsActiv', function(req, res){
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
          res.end();
        });
      } else {
        res.end();
      }
    }).catch(function(err){
      console.log(err);
    });
  });
});

router.post('/saveMsg', function(req, res){
	var conversationId = req.body.conversationId;
	var messageToSave = req.body.message;
	Conversation.getConversationById(conversationId, function(err, conversation){
		if (err){
			console.log(err);
		} else {
      var time = moment()
      var promise = new Promise(function(resolve, reject){
        conversation.messages.push({
          msg: messageToSave,
          msgOwner: req.user.id,
          msgOwnerName: req.user.firstName
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
});

// Send the message notification to append new messages ONLY
router.post('/msgNotif', function(req, res){
	var promise = new Promise(function(resolve, reject){
		var msg = req.body.msg;
		var paricipants = req.body.participants;
		var msgOwnerName = req.user.firstName;
    var dataId = req.body.convId;
		var time = new Date();
		var msgTime = moment(time).format('DD-MM-YYYY, hh:mm:ss');
		var obj = {"msg": msg, "msgOwnerName": msgOwnerName, "participants": paricipants, "avatar": req.user.avatar, "msgTime": msgTime, "dataId": dataId};
		resolve(obj);
	}).then(function(object){
    if (object.participants[0] == req.user.id){
      var userToNotify = object.participants[1];
      pusher.trigger(userToNotify, 'new-message', object);
    } else {
      var userToNotify2 = object.participants[0];
      pusher.trigger(userToNotify2, 'new-message', object);
    }
		res.end();
	}).catch(function(err){
		console.log(err);
	});
});


router.post('/clearNotif', function(req, res){
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
    });
    resolve();
  }).then(function(user){
    res.send(true);
  }).catch(function(err){
    console.log(err);
  });
});

router.post('/deleteconversation', function(req, res){
  var convId = req.body.convId;
  var user = req.user;
  user.conversations.forEach(function(conversation, index, object){
    if(conversation == convId){
      object.splice(index, 1);
      user.save();
    }
  });
  res.send({ok: true});
});

router.get('/demandes', function(req, res){
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
                  if(user.evals.length){
                    user.evals.forEach(function(eval, indexeval, objecteval){
                      if(eval.fordemand == dem.id){
                        user.evals.splice(indexeval, 1);
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
      }, 2000)
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
                  dem.formatedtimeHours = moment(time).format("hh:mm");
                  if(expiretime != 0){
                    dem.diff = expiretime;
                  }
                  var created = dem.createdTime;
                  dem.formatedcreatedTime = moment(created).format("DD/MM/YYYY, hh:mm");
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
                        res.render('demandes', {"user": connectedUser, "demands": demands, "reservations": reservations, "mydemands": mydemands, "myreservations": myreservations, "newmessages": connectedUser.notifications.length, "newdemands": connectedUser.demandNotifications.length, "allNotifications": connectedUser.demandNotifications.length + connectedUser.notifications.length});
                      } else {
                        res.render('demandes', {"user": req.user, "err":"Vous n'avez aucune demande pour le moment", "newmessages": connectedUser.notifications.length, "newdemands": connectedUser.demandNotifications.length, "allNotifications": connectedUser.demandNotifications.length + connectedUser.notifications.length});
                      }
                    }, 1000)
                  }
                }
              })
            }
          })
        })
      } else {
          res.render('demandes', {"user": req.user, "err":"Vous n'avez aucune demande pour le moment", "newmessages": connectedUser.notifications.length, "newdemands": connectedUser.demandNotifications.length, "allNotifications": connectedUser.demandNotifications.length + connectedUser.notifications.length});
      }
    })
})

router.post('/acceptdemand', function(req, res){
  var demandId = req.body.demandId;
  Demand.getDemandById(demandId, function(err, demand){
    var time = demand.time;
    var appoinementTime = moment(time).format("DD/MM/YYYY, hh:mm");
    if(moment(time) > moment()){
      demand.approuved = true;
      demand.valid = false;
      demand.save();
      var demandId = demand.creator.toString();
      pusher.trigger(demandId, 'demands', {"demandAccepter": true});
      User.getUserById(demand.creator, function(err, user){
        if(err){
          console.log(err)
        } else {
          user.demandNotifications.push({"demandid": demand.id});
          user.save();
          var user2 = req.user;
          user2.demandNotifications.forEach(function(notif, index, object){
            if(notif.demandid == demand.id){
              object.splice(index, 1);
              user2.save();
            }
          })
        }
      });
      res.send({"status": true, "appoinementTime": appoinementTime});
    } else {
      var userst = req.user;
      var client = demand.creator;
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

      if(userst.evals.length){
        userst.evals.forEach(function(evalst, indexste, objectste){
          if(demand.id.toString() == evalst.fordemand.toString()){
            userst.evals.splice(indexste, 1);
            userst.save();
          }
        })
      }

      User.getUserById(client, function(err, client){
        if(err){
          console.log(err)
        } else {
          if(client.demands.length){
            client.demands.forEach(function(demcl, indexcl, objectcl){
              if(demcl.toString() == demand.id.toString()){
                client.demands.splice(indexcl, 1);
                client.save();
              }
            })
          }

          if(client.demandNotifications.length){
            client.demandNotifications.forEach(function(demclN, indexclN, objectclN){
              if(demclN.demandid.toString() == demand.id.toString()){
                client.demandNotifications.splice(indexclN, 1);
                client.save();
              }
            })
          }

          if(client.evals.length){
            client.evals.forEach(function(evalcl, indexcle, objectcle){
              if(demand.id.toString() == evalcl.fordemand.toString()){
                client.evals.splice(indexcle, 1);
                client.save();
              }
            })
          }

        }
      })
      res.send({"expired":true})
    }
  })
});

router.post('/declinedemand', function(req, res){
  var demandId = req.body.demandId;
  Demand.getDemandById(demandId, function(err, dem){
    dem.valid = false;
    dem.save();
    dem.participants.forEach(function(userid){
      User.getUserById(userid, function(err, user){
        user.evals.forEach(function(eval, index2, object2){
          if(eval.fordemand == dem.id){
            object2.splice(index2, 1);
            user.save();
          }
        })
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
      })
    });

    User.getUserById(dem.creator, function(err, user){
      client.sms.messages.create({
        to:user.phone,
        from:'+33644607659',
        body:'FASON: Votre dernière demande sur Fason a été déclinée. Vous pouvez désormais en refaire une autre.',
      }, function(err, message) {
        if(err){
          console.log(err);
        }
      })
    })
  })
  res.send(true);
});

router.get('/mystyleboxes', function(req, res){
  if(req.user){
    var styleboxes = [];
    if(req.user.styleboxes.length){
      req.user.styleboxes.forEach(function(stylebox, index, object){
        Stylebox.getStyleboxById(stylebox, function(err, style){
          if(err){
            console.log(err)
          } else {
            var rating = {};
            var general = 0;
            var communication = 0;
            var quality = 0;
            var ponctuality = 0;
            var precision = 0;
            if(req.user.rating.length){
              req.user.rating.forEach(function(rat, index2, object2){
                communication = communication + rat.communication;
                quality = quality + rat.qualityprice;
                ponctuality = ponctuality + rat.ponctuality;
                precision = precision + rat.precision;

                if(index2+1 == req.user.rating.length){
                  var styleboxproto = style;
                  rating.general = (quality+communication+ponctuality+precision)/(req.user.rating.length * 4);
                  rating.number = object2.length;
                  styleboxproto.rating = rating;
                  //separator
                  styleboxproto.stylistname = req.user.lastName;
                  styleboxproto.stylistavatar = req.user.avatar;
                  styleboxes.push(styleboxproto);
                  if(index+1 == req.user.styleboxes.length){
                    res.render('mystyles', {"user": req.user, "styleboxes": styleboxes, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
                  }
                }
              })
            } else {
              var styleboxproto = style;
              rating.general = -1;
              rating.number = 0;
              styleboxproto.rating = rating;
              styleboxproto.stylistname = req.user.lastName;
              styleboxproto.stylistavatar = req.user.avatar;
              styleboxes.push(styleboxproto);
              if(index+1 == req.user.styleboxes.length){
                res.render('mystyles', {"user": req.user, "styleboxes": styleboxes, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
              }
            }
          }
        })
      })
    } else {
      res.render('mystyles', {"user": req.user, "err": "Vous n'avez aucun stylebox en ligne, créez votre stylebox en cliquand sur le lien suivant:", "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
    }
  } else {
    res.redirect('https://fason.herokuapp.com/')
  }
});

router.get('/stylebox/edit/:id', function(req, res){
  var styleboxId = req.params.id;
  Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
    if(err){
      console.log(err)
      res.redirect('https://fason.herokuapp.com/');
    } else {
      if (stylebox.creator == req.user.id) {
        var stylistNeededInfo = {"firstName": req.user.firstName, "lastName": req.user.lastName, "avatar": req.user.avatar, "description": req.user.stylist.description, "availability": req.user.stylist.availability};
        var rating = {};
        var general = 0;
        var communication = 0;
        var quality = 0;
        var ponctuality = 0;
        var precision = 0;
        if(req.user.rating.length){
          req.user.rating.forEach(function(rat, index, object){
            communication = communication + rat.communication;
            quality = quality + rat.qualityprice;
            ponctuality = ponctuality + rat.ponctuality;
            precision = precision + rat.precision;

            if(index+1 == req.user.rating.length){
              rating.quality = quality/req.user.rating.length;
              rating.communication = communication/req.user.rating.length;
              rating.ponctuality = ponctuality/req.user.rating.length;
              rating.precision = precision/req.user.rating.length;
              rating.general = (quality+communication+ponctuality+precision)/(req.user.rating.length * 4);
              rating.number = req.user.rating.length;
              res.render('editstylebox', {"stylebox": stylebox,"rating": rating, "stylist": stylistNeededInfo, user: req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
            }
          });
        } else {
          res.render('editstylebox', {"stylebox": stylebox,"rating": rating, "stylist": stylistNeededInfo, user: req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
        }
      } else {
        res.redirect('https://fason.herokuapp.com/');
      }
    }
  })
})

router.post('/stylebox/delete', function(req, res){
  var styleboxId = req.body.styleboxId;
  Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
    if(stylebox.creator == req.user.id){
      req.user.styleboxes.forEach(function(style, index, object){
        if(style == stylebox.id){
          object.splice(index, 1);
          req.user.save();
          stylebox.remove(function (err) {
              // if no error, your model is removed
              if(err){
                console.log(err)
              }
          });
          res.send({list:req.user.styleboxes.length});
        }
      })
    }
  });
});

router.post('/editstylebox', function(req, res){
  var styleboxId = req.body.styleboxId;

  var budget = req.body.budget;
  var title = req.body.title;
  var price = req.body.price;
  var styleObject = req.body.styleObject;
  var gender = req.body.gender;
  var minTime = req.body.minTime;
  var city  = req.body.city;
  var description = req.body.description;

  function checkcity(citytest){
    if(citytest != ""){
      return citytest
    } else {
      return req.user.city;
    }
  }


  Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
    stylebox.photos.forEach(function(photo, index, object){
      s3.deleteObject({
        Bucket: 'styleboxphotosfason',
        Key: photo
      },function (err,data){
        if(err){
          console.log(err)
        }
      })

      if(index+1 == stylebox.photos.length){
        stylebox.title = title;
        stylebox.price = price;
        stylebox.gender = gender;
        stylebox.description = description;
        stylebox.style = styleObject.style;
        stylebox.vestimentaire = styleObject.vestimentaire;
        stylebox.beaute = styleObject.beaute;
        stylebox.minBudget = budget;
        stylebox.minTime = minTime;
        stylebox.photos = dbPic;
        stylebox.city = checkcity(city);
        stylebox.save();
        dbPic = [];
        res.send(true);
      }
    })
  });
})

router.get('/evaluate', function(req, res){
  if(req.user){
    var connectedUser = req.user;
    var evalsArray = [];
    connectedUser.evals.forEach(function(eval, index, object){
      if(moment(eval.startDate) < moment() && moment(eval.endDate) > moment() && eval.participated == false){
        var evalProto = {};
        evalProto.evalId = eval.id;
        if(eval.stylistId){
          User.getUserById(eval.stylistId, function(err, user){
            evalProto.stylistId = eval.stylistId;
            evalProto.stylistAvatar = user.avatar;
            evalProto.stylistName = user.lastName;
          });
        } else {
          User.getUserById(eval.userId, function(err, user){
            evalProto.userId = eval.userId;
            evalProto.userAvatar = user.avatar;
            evalProto.userName = user.lastName;
          });
        }

        Stylebox.getStyleboxById(eval.forstylebox, function(err, stylebox){
          evalProto.styleboxTitle = stylebox.title;
          evalProto.styleboxId = stylebox.id;
        });

        Demand.getDemandById(eval.fordemand, function(err, demand){
          evalProto.makeover = moment(demand.time).format('DD-MM-YYYY, hh:mm:ss');
        })
      }
      evalsArray.push(evalProto);
    });

    setTimeout(function(){
      res.render('evaluate', {"evalsArray": evalsArray, "user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
    }, 1000);
  } else {
    res.render('evaluate', {"evaluations": evaluations, "user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  }
})

router.post('/evaluate', function(req, res){
  var stylistId = req.body.stylistId;
  var styleboxId = req.body.styleboxId;
  var evalId = req.body.evalId;
  var userId = req.body.userId;
  var connectedUser = req.user;
  var communication = req.body.communication;
  var precision = req.body.precision;
  var quality = req.body.quality;
  var ponctuality = req.body.ponctuality;
  var comment = req.body.comment;
  if(stylistId){
    var commentObject = {};
    User.getUserById(stylistId, function(err, stylist){
      commentObject.creator = connectedUser.id;
      commentObject.foruser = stylistId;
      commentObject.commentBody = comment.toString();
      commentObject.stylebox = styleboxId;
      commentObject.creatorAva = connectedUser.avatar;
      commentObject.creatorName = connectedUser.lastName;
      connectedUser.evals.forEach(function(eval, indexe, objecte){
        if(eval.id == evalId){
          commentObject.showDate = eval.endDate;
          Comments.createNewComment(commentObject, function(err, savedComment){
            if(err){
              console.log(err)
            } else {
              stylist.comments.push(savedComment);
              stylist.save();
            }
          })
          eval.participated = true;
          connectedUser.save();
        }
      })

      var ratingObj = {"precision": precision, "qualityprice": quality, "communication": communication, "ponctuality": ponctuality};
      stylist.rating.push(ratingObj);
      stylist.save();

    })
  }

  if(userId){
    var commentObject = {};
    User.getUserById(userId, function(err, userc){
      commentObject.creator = connectedUser.id;
      commentObject.foruser = userId;
      commentObject.commentBody = comment.toString();
      commentObject.stylebox = styleboxId;
      commentObject.creatorAva = connectedUser.avatar;
      connectedUser.evals.forEach(function(eval, indexe, objecte){
        if(eval.id == evalId){
          commentObject.showDate = eval.endDate;
          Comments.createNewComment(commentObject, function(err, savedComment){
            if(err){
              console.log(err)
            } else {
              userc.comments.push(savedComment);
              userc.save();
            }
          })
          eval.participated = true;
          connectedUser.save();
        }
      })
    })
  }
  res.send(true);
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
  var message = req.body.messagemail;
  var mailOptions = {
      from: '"Fason service client" <fason.contact@gmail.com>', // sender address
      to: "fason.contact@gmail.com", //
      subject : "Nouveau message d'un client!!!!!",
      html : message
  };
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      } else {
        res.redirect("https://fason.herokuapp.com/");
      }
  });
})


router.get('/conditions', function(req, res){
  if(req.user){
    res.render('conditions', {"user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
  } else {
    res.render('conditions');
  }
})

router.get('/login', function(req, res){
  res.render('login');
})

router.get('/register', function(req, res){
  res.render('register');
})

router.get('/searchxs', function(req, res){
  res.render('searchxs');
})
module.exports = router;
