var mongoose = require('mongoose');
require('mongo-relation');
var Schema = mongoose.Schema;
// Stats Schema

var StatsSchema = mongoose.Schema({
  creator:{type:String},
  subject: {type: String, default: "non"},
  createdTime:{type:Date, default:Date.now}
});

var Stat =  mongoose.model('Stat', StatsSchema);
module.exports = Stat;

module.exports.createNewStat = function(newStat, callback){
  var stat = new Stat();
  stat.creator = newStat.creator;
  stat.subject = newStat.subject;
  stat.save(callback);
}

module.exports.getStatById = function(id, callback){
	Connu.findById(id, callback);
}
