var mongoose = require('mongoose');
require('mongo-relation');
var User = require('./user');
var Demand = require('./demand');
var Stylebox = require('./stylebox');
var relationship = require("mongoose-relationship");
var Schema = mongoose.Schema;
// Eval Schema

var EvalSchema = mongoose.Schema({
  forDemand:{type:Schema.ObjectId, ref:"Demand"},
  forStylebox:{type:Schema.ObjectId, ref:"Stylebox"},
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  stylistId: {type : Schema.ObjectId, ref : 'User'},
  clientId: {type : Schema.ObjectId, ref : 'User'},
  clientCommented: {type: Boolean, default: false},
  stylistCommented: {type: Boolean, default: false},
  expired: {type: Boolean, default: false},
  createdTime:{type:Date, default:Date.now}
});


var Eval =  mongoose.model('Eval', EvalSchema);
module.exports = Eval;

module.exports.createNewEval = function(newEval, callback){
  var eval = new Eval();
  eval.forDemand = newEval.forDemand;
  eval.forStylebox = newEval.forStylebox;
  eval.startDate = newEval.startDate;
  eval.endDate = newEval.endDate;
  eval.stylistId = newEval.stylistId;
  eval.clientId = newEval.clientId;
  eval.expired = newEval.expired;
  eval.save(callback);
}

module.exports.getEvalById = function(id, callback){
	Eval.findById(id, callback);
}
