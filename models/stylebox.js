var mongoose = require('mongoose');
require('mongo-relation');
var User = require('./user');
var Comment = require('./comment');
var relationship = require("mongoose-relationship");
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
// User Schema
var StyleboxSchema = mongoose.Schema({
	title: String,
	price: String,
	vestimentaire: Boolean,
	beaute: Boolean,
	style: String,
	gender: String,
	minTime: String,
	minBudget: Number,
	description: String,
	city: String,
	photos: [String],
	comments:[{ type:Schema.ObjectId, ref:"Comment"}],
	creator:{type:Schema.ObjectId,ref:"User",childPath:"styleboxes" },
	createdTime:{type:Date, default:Date.now}
});


StyleboxSchema.plugin(relationship, { relationshipPathName:'creator'});
StyleboxSchema.plugin(mongooseAggregatePaginate);

var Stylebox =  mongoose.model('Stylebox', StyleboxSchema);
module.exports = Stylebox;

module.exports.getStyleboxById = function(id, callback){
	Stylebox.findById(id, callback);
}

module.exports.createNewStylebox = function(newStyle, callback){
	        newStyle.save(callback);
}
