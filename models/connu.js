var mongoose = require('mongoose');
require('mongo-relation');
var User = require('./user');
var Schema = mongoose.Schema;
// Connu Schema

var ConnuSchema = mongoose.Schema({
  creator:{type:Schema.ObjectId, ref:"User"},
  moyen: {
    type: String,
    default: "non"
  },
  createdTime:{type:Date, default:Date.now}
});

var Connu =  mongoose.model('Connu', ConnuSchema);
module.exports = Connu;

module.exports.createNewConnu = function(newConnu, callback){
  var connu = new Connu();
  connu.creator = newConnu.creator;
  connu.moyen = newConnu.moyen;
  connu.save(callback);
}

module.exports.getConnuById = function(id, callback){
	Connu.findById(id, callback);
}
