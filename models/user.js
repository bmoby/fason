var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Stylebox = require('./stylebox');
var Eval = require('./eval');
var Commentss = require('./comment');
var Demand = require('./demand');
var Conversation = require('./conversation');
var relationship = require("mongoose-relationship");
var Schema = mongoose.Schema;
// User Schema
var UserSchema = mongoose.Schema({
	password: {
		type: String,
		required: true
	},
	connu: {
		type: Boolean,
		default: true,
	},
	avatar: {
		type: String,
		default: ""
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	firstName: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		unique: true
	},
	phoneVerification: String,
	lastName: {
		type: String,
		required: true
	},
	evals: [{ type:Schema.ObjectId, ref:"Eval" }],
	styleboxes:{ type:Schema.ObjectId, ref:"Stylebox" },
	demands:[{ type:Schema.ObjectId, ref:"Demand" }],
	conversations: [{type : Schema.ObjectId, ref : 'Conversation'}],
	varified: {
		type: Boolean,
		default: false
	},
	phoneIsVerified: {
		type: Boolean,
		default: false
	},
	verifyEmailString: {
		type: String
	},
	resetPwdString: { type: String, default: ""},
	stylist: {
		status: {
			type: Boolean,
			default: false
		},
		stylistSince: { type : Date, default: Date.now }
	},
	notifications: [{"notifMsg": String, "notifType": String, "notifTime": { type : Date, default: Date.now }, "msgId": String}],
	demandNotifications: [{"demandid": String, "notifTime": { type : Date, default: Date.now }}],
	createdTime: { type : Date, default: Date.now }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.getUserByPhone = function(phone, callback){
	var query = {phone: phone};
	User.findOne(query, callback);
}

module.exports.getUserByVerifyEmailString = function(verifyEmailString, callback){
	var query = {verifyEmailString: verifyEmailString};
	User.findOne(query, callback);
}

module.exports.getUserByPassword = function(password, callback){
	var query = {password: password};
	User.findOne(query, callback);
}

module.exports.getUserByResetToken = function(resetPwdString, callback){
	var query = {resetPwdString: resetPwdString};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}
