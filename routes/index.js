var express = require('express');
var router = express.Router();
var Conversation = require('../models/conversation');
var Promise = require('promise');
var Pusher = require('pusher');
var User = require('../models/user');
var Eval = require('../models/eval');
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

    res.render('index', {"user": req.user,
                          "newmessages": notifcount,
                          "newdemands": newdemands,
                          "allNotifications": allnotifs});
  } else {
    res.render('index');
  }
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
  var style = req.body.style;

  var promise = new Promise(function(resolve, reject){
    var options = {};

    options.creator = {"$exists" : true};
    if(city){
      options.city = { "$regex": city, "$options": "i" }
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
        console.log(err)
      } else {
        var mens = false;
        var womans = false;
        if (obje.gender == "men"){
          mens = true;
        }

        if (obje.gender == "ladies"){
          womans = true;
        }

        var styleObj = {
          vestimentaire: false,
          beaute: false,
        }

        switch(obje.style){
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
                        setTimeout(function(){
                          if(req.user){
                            res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user, "newmessages": req.user.notifications.length, "options": obje, "men": mens, "ladies": womans, "styleObj": styleObj, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
                          } else {
                            res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user, "options": obje, "men": mens, "ladies": womans, "styleObj": styleObj});
                          }
                        }, 500);
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
                    setTimeout(function(){
                      if(req.user){
                        res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user, "newmessages": req.user.notifications.length, "options": obje, "men": mens, "ladies": womans, "styleObj": styleObj, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
                      } else {
                        res.render('search', {"styleboxes": styleboxesandstylist, "user": req.user, "options": obje, "men": mens, "ladies": womans, "styleObj": styleObj});
                      }
                    }, 500)
                  }
                }
              });
          })
        } else {
          if(req.user){
            res.render('search', {"user": req.user, "newmessages": req.user.notifications.length, "errmsg": "Aucun look ne correspond à votre recherche", "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length})
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
  var commentList = [];
  var styleboxId = req.params.id;
  Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
    if(stylebox){
      if(stylebox.comments){
        stylebox.comments.forEach(function(comment, indexcom, objectcom){
          Comments.getCommentById(comment, function(err, com){
            if(err){
              console.log(err)
            } else {
              if(moment(com.showDate) < moment()){
                var formatedCreated = moment(com.createdTime).format('DD-MM-YYYY, HH:mm');
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

          switch(stylebox.style){
            case "allbeauty":
              style = "Relooking beauté";
            break;
            case "all":
              style = "Relooking vestimentaire";
            break;
            case "casual":
              style = "Casual";
            break;
            case "businesscasual":
              style = "Business casual";
            break;
            case "businessformal":
              style = "Business formal";
            break;
            case "streetwear":
              style = "Streetwear";
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
              style = "not found";
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
                  res.render('stylebox-display',
                    {"styleboxcomments": commentList,
                      "stylebox": stylebox,
                      "rating": rating,
                      "stylist": stylistNeededInfo,
                      "gender": gender,
                      "style": style,
                      "user": req.user,
                      "newmessages": req.user.notifications.length,
                      "haveToVerify": haveToVerify,
                      "newdemands": req.user.demandNotifications.length,
                      "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
                } else {
                  res.render('stylebox-display', {"styleboxcomments": commentList, "stylebox": stylebox, "rating": rating, "stylist": stylistNeededInfo,  "style": style, "gender": gender, "haveToVerify": haveToVerify});
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
            if(req.user){res.render('stylebox-display',
              {"styleboxcomments": commentList,
              "stylebox": stylebox,
              "rating": rating,
              "stylist": stylistNeededInfo,
              "style": style,
              "gender": gender,
              "user": req.user,
              "newmessages": req.user.notifications.length,
              "haveToVerify": haveToVerify,
              "newdemands": req.user.demandNotifications.length,
              "allNotifications": req.user.demandNotifications.length + req.user.notifications.length})
            } else {
              res.render('stylebox-display', {"styleboxcomments": commentList, "stylebox": stylebox, "rating": rating, "stylist": stylistNeededInfo,  "style": style, "gender": gender, "haveToVerify": haveToVerify});
            }
          }
        }
      })
    } else {
      res.render('notfound')
    }
  })
})

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
  if(req.user){
    if(req.user.stylist.status){
      res.render('createstylebox', {user: req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
    } else {
      res.render('become-stylist', {user: req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
    }
  } else {
    res.redirect('http://fason.co/');
  }
})


var uploadMulter = multer({dest: 'public/img'})


router.post('/createstylebox', function(req, res){
  if(req.user){
    var budget = req.body.budget;
    var title = req.body.title;
    var price = req.body.price;
    var styleObject = req.body.styleObject;
    var style = req.body.style;
    var gender = req.body.gender;
    var minTime = req.body.minTime;
    var city  = req.body.city;
    var description = req.body.description;
    var pics = req.body.pics;
    var photos = req.body.allphotos;

    function checkcity(citytest){
      if(citytest != ""){
        return citytest
      } else {
        return req.user.city;
      }
    }

    if(pics.length >= 3){
      var  stopThis = false;
      pics.forEach(function(pic, index, object){
        if(pic == null){
          res.send({"errmsg": true});
          stopThis = true;
        }

        if(index+1 == object.length && stopThis == false){
          var newStyle = new Stylebox({
            title: title,
            price:price,
            vestimentaire: styleObject.vestimentaire,
            beaute: styleObject.beaute,
            style: style,
            gender: gender,
            minTime: minTime,
            photos: pics,
            city: checkcity(city),
            minBudget: budget,
            description: description,
            creator: req.user
          });


          Stylebox.createNewStylebox(newStyle, function(err, stylebox){
            if(err) {
              console.log(err)
              res.send({"stylebox": false});
            } else {
              var userto = req.user;
              userto.styleboxes.push(stylebox.id);
              userto.save();
              var mailOptions = {
                  from: '"Fason service client" <fason.contact@gmail.com>',
                  to: "fason.contact@gmail.com",
                  subject : "Encore un look!",
                  html : "yesss on a encore un look bro! titre : <br>"+ newStyle.title +"<br> ID : <br>" + newStyle.id + "user that is creating this style is : " + req.user.id
              };
              transporter.sendMail(mailOptions, function(error, info){
                  if(error){
                      return console.log(error);
                  }
              });
              res.send({"stylebox": true});
            }
          });
        }
      })
    } else {
      res.send({"errmsg": true});
    }
  } else {
    res.send({"nouser": true});
  }
});

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
    var firstName = req.user.firstName;
    var now = Date.now();
    var msgTime = moment(now).format('DD-MM-YYYY, HH:mm');
    res.send({"found": true, "avatar": avatar, "firstname": firstName, "time":msgTime});
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
              msgOwnerName: req.user.firstName,
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
  		var msgOwnerName = req.user.firstName;
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
        newEval.clientId = req.user.id;
        newEval.forStylebox = demand.forStylebox;
        console.log(demand.forstyle, "FOR STYLE FOR EVAL");
        demand.participants.forEach(function(par, inde, obje){
          if(par != req.user.id){
            newEval.clientId = par;
            setTimeout(function(){
              Eval.createNewEval(newEval, function(err, savedEval){
                if(err){
                  console.log(err)
                } else {
                  demand.participants.forEach(function(par, indexpar, objectpar){
                    User.getUserById(par, function(err, user){
                      if(err){
                       console.log(err)
                     }
                     if(user){
                       user.evals.push(savedEval);
                       user.save();
                     }
                    })
                  })
                }
              })
            }, 500);
          }
        })

        pusher.trigger(creatorId, 'demands', {"demandAccepter": true});
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
        var clientId = demand.creator;
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

        User.getUserById(clientId, function(err, clientS){
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
      dem.participants.forEach(function(userid){
        User.getUserById(userid, function(err, user){
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
      res.render('mystyles', {"user": req.user, "err": "Vous n'avez aucun look en ligne. Créez en un en cliquant sur le lien suivant :", "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
    }
  } else {
    res.redirect('http://fason.co/')
  }
});

router.get('/styleboxedit/:id', function(req, res){
  if(req.user){
    var styleboxId = req.params.id;
    Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
      if(err){
        console.log(err)
        res.redirect('http://fason.co/');
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
                res.render('editstylebox',
                {"stylebox": stylebox,
                "rating": rating,
                "stylist": stylistNeededInfo,
                "user": req.user,
                "newmessages": req.user.notifications.length,
                "newdemands": req.user.demandNotifications.length,
                "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
              }
            });
          } else {
            res.render('editstylebox', {"stylebox": stylebox,"rating": rating, "stylist": stylistNeededInfo, user: req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
          }
        } else {
          res.redirect('http://fason.co/');
        }
      }
    })
  } else {
    res.redirect('http://fason.co/');
  }
})

router.post('/styleboxdelete', function(req, res){
  if(req.user){
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
            console.log("ON A TROUVE UNE EVALUATION")
            if(evalu.stylistId == req.user.id){
              console.log("EVALUATION POUR LE STYLIST")
              if(evalu.stylistCommented){
                console.log("IL A DEJA COMMENTE")
                console.log("okeyno")
                if(index+1  == object.length){
                  console.log("ON A L'EVAL ET ON A TERMINE", count)
                  if(count){
                    console.log("Y A CES TRUCS A ENVOYER", count)
                    res.send({"evals": count, "send": true});
                  } else {
                    res.send({"noeffect": true})
                  }
                }
              } else {
                console.log("IL A JAMAIS COMMENTE LE STYLIST")
                if(moment(evalu.startDate) < moment() && moment(evalu.endDate) > moment()){
                  console.log("LES CRITERES SONT BON")
                  count = count+1;
                  if(index+1  == object.length){
                    console.log("ON A TERMINE DE PARCOURIR LA LISTE")
                    res.send({"evals": count, "send": true});
                  }
                }
              }
            } else {
                console.log("C'EST UN CLIENT ET NON PAS UN STYLIST")
              if(evalu.clientCommented){
                console.log("IL A DEJA COMMENTEE")
                if(index+1 == object.length){
                  if(count){
                    res.send({"evals": count, "send": true});
                  } else {
                    res.send({"noeffect": true})
                  }
                }
              } else {
                console.log("LE CLIENT N'A JAMAIS COMMENTEEE")
                console.log(count, " THIS IS THE COUNT")
                console.log(evalu)
                console.log(moment(evalu.startDate), moment())
                console.log(moment(evalu.endDate), moment())
                if(moment(evalu.startDate) < moment() && moment(evalu.endDate) > moment()){
                  console.log("LES CRITERES SONT BON")
                  count = count+1;
                  if(index+1 == object.length){
                    console.log("ON A FINI DE PARCOURIR LA LISTE")
                    res.send({"evals": count, "send": true});
                  }
                } else {
                  console.log("LES CRITERES SONT PAS BONS")
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
            } else {
              console.log("C'ETAIT CA LE PB")
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

router.post('/editstylebox', function(req, res){
  if(req.user){
    var styleboxId = req.body.styleboxId;
    var budget = req.body.budget;
    var title = req.body.title;
    var price = req.body.price;
    var styleObject = req.body.styleObject;
    var style = req.body.style;
    var gender = req.body.gender;
    var minTime = req.body.minTime;
    var city  = req.body.city;
    var description = req.body.description;
    var photos = req.body.pics;
    function checkcity(citytest){
      if(citytest != ""){
        return citytest
      } else {
        return req.user.city;
      }
    }

    Stylebox.getStyleboxById(styleboxId, function(err, stylebox){
      stylebox.photos.forEach(function(photo, index, object){
        if(index+1 == stylebox.photos.length){
          emptyStylebox = stylebox.id;
          stylebox.title = title;
          stylebox.price = price;
          stylebox.gender = gender;
          stylebox.description = description;
          stylebox.style = style;
          stylebox.vestimentaire = styleObject.vestimentaire;
          stylebox.beaute = styleObject.beaute;
          stylebox.minBudget = budget;
          stylebox.photos = req.body.pics;
          stylebox.minTime = minTime;
          stylebox.city = checkcity(city);
          stylebox.save();
          res.send({"edited": true});
        }
      })
    });
  } else {
    res.redirect('http://fason.co/');
  }
})

router.get('/evaluate', function(req, res){
  if(req.user){
    var connectedUser = req.user;
    var evalsArray = [];
    connectedUser.evals.forEach(function(evall, index, object){
      Eval.getEvalById(evall, function(err, eval){
        if(moment(eval.startDate) < moment() && moment(eval.endDate) > moment()){
          var evalProto = {};
          evalProto.evalId = eval.id;

          if(eval.stylistId == req.user.id){
            User.getUserById(eval.clientId, function(err, user){
              if(user){
                evalProto.userId = eval.clientId;
                evalProto.userAvatar = user.avatar;
                evalProto.userName = user.lastName;
              } else {

                evalProto.problem = true;
              }
            });
          } else {
            User.getUserById(eval.stylistId, function(err, user){
              if(user){
                evalProto.stylistId = eval.stylistId;
                evalProto.stylistAvatar = user.avatar;
                evalProto.stylistName = user.lastName;
              } else {
                evalProto.problem = true;
              }
            });
          }

          Stylebox.getStyleboxById(eval.forStylebox, function(err, stylebox){
            if(stylebox){
              evalProto.styleboxTitle = stylebox.title;
              evalProto.styleboxId = stylebox.id;
            } else {
              evalProto.styleboxTitle = "Existe plus";
            }
          });

          Demand.getDemandById(eval.forDemand, function(err, demand){
            if(demand){
              evalProto.makeover = moment(demand.time).format('DD-MM-YYYY, HH:mm');
            } else {
              evalProto.problem = true;
            }
          })

          setTimeout(function(){
            if(evalProto.problem){
              object.splice(index, 1);
              connectedUser.save();
            } else {
              evalsArray.push(evalProto);
            }
          }, 500);
        }
      })
    });

    setTimeout(function(){
      res.render('evaluate', {"evalsArray": evalsArray, "user": req.user, "newmessages": req.user.notifications.length, "newdemands": req.user.demandNotifications.length, "allNotifications": req.user.demandNotifications.length + req.user.notifications.length});
    }, 1000);
  } else {
    res.redirect('http://fason.co/');
  }
})

router.post('/evaluate', function(req, res){
  if(req.user){
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
            Eval.getEvalById(evalId, function(err, evall){
              commentObject.showDate = evall.endDate;
              evall.clientCommented = true;
              evall.save();
              objecte.splice(indexe, 1);
              connectedUser.save();
              Comments.createNewComment(commentObject, function(err, savedComment){
                if(err){
                  console.log(err)
                } else {
                  stylist.comments.push(savedComment);
                  stylist.save();
                }
              });
            })

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
        commentObject.creatorAva = connectedUser.avatar;
        connectedUser.evals.forEach(function(eval, indexe, objecte){

            Eval.getEvalById(evalId, function(err, evall){
              commentObject.showDate = evall.endDate;
              evall.stylistCommented = true;
              evall.save();
              objecte.splice(indexe, 1);
              connectedUser.save();
              Comments.createNewComment(commentObject, function(err, savedComment){
                if(err){
                  console.log(err)
                } else {
                  userc.comments.push(savedComment);
                  userc.save();
                }
              })
            })
        })
      })
    }
    res.send(true);
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
})

module.exports = router;
