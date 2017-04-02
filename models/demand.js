var mongoose = require('mongoose');
require('mongo-relation');
var User = require('./user');
var relationship = require("mongoose-relationship");
var Schema = mongoose.Schema;
// Demand Schema

var DemandSchema = mongoose.Schema({
  creator:{type:Schema.ObjectId,ref:"User",childPath:"demands" },
  participants: [ {type : Schema.ObjectId, ref : 'User'} ],
  time: {
    type: Date
  },
  approuved: {
    type: Boolean,
    default: false,
    expire: {
      type: Date
    }
  },
  declined: {
    type: Boolean,
    default: false
  },
  valid: {
    type: Boolean,
    default: true
  },
  commentTime: {
    type: Boolean,
    default: false
  },
  forstyle: String,
  creatorName: String,
  commented: [{type : Schema.ObjectId, ref : 'User'}],
  createdTime:{type:Date, default:Date.now}
});

DemandSchema.plugin(relationship, { relationshipPathName:'creator' });

var Demand =  mongoose.model('Demand', DemandSchema);
module.exports = Demand;

module.exports.createNewDemand = function(newDemand, callback){
  var demand = new Demand();
  demand.creator = newDemand.creator;
  demand.participants = newDemand.participants;
  demand.time = newDemand.time;
  demand.creatorName = newDemand.creatorName;
  demand.forstyle = newDemand.forstyle;
  demand.save(callback);
}

module.exports.getDemandById = function(id, callback){
	Demand.findById(id, callback);
}
