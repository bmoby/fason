var mongoose = require('mongoose');
require('mongo-relation');
var User = require('./user');
var Comment = require('./comment');
var relationship = require("mongoose-relationship");
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
// User Schema
var StyleboxSchema = mongoose.Schema({
	rating: [{
		"precision":{
			type: Number,
			default: 0
		},
		"qualityprice": {
			type: Number,
			default: 0
		},
		"communication":{
			type: Number,
			default: 0
		},
		"ponctuality":{
			type: Number,
			default: 0
		}
	}],
	relookingtrue: {type:Boolean, default:false},
	beautetrue: {type:Boolean, default:false},
	corsestrue: {type:Boolean, default:false},
	availability: String,
	relooking: [
		{
			val:{type:String, default:"reve-shoppingvotreplace"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"reve-accompshopping"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"reve-trigrdrob"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"reve-tourmagville"},
			ok:{type:Boolean, default:false}
		}
	],
	beaute: [
		{
			val:{type:String, default:"beau-maqui"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"beau-coiff"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"beau-color"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"beau-manuc"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"beau-pedic"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"beau-surci"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"beau-soinviz"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"beau-soincor"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"beau-tailbarb"},
			ok:{type:Boolean, default:false}
		}
	],
	corses: [
		{
			val:{type:String, default:"cour-maqui"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"cour-coiff"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"cour-color"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"cour-manuc"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"cour-pedic"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"cour-surci"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"cour-soinviz"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"cour-soincor"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"cour-tailbarb"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"cour-couleur"},
			ok:{type:Boolean, default:false}
		},
		{
			val:{type:String, default:"cour-morpho"},
			ok:{type:Boolean, default:false}
		}
	],
	valid: Boolean,
	generalprocess: String,
	price: String,
	men: Boolean,
	women: Boolean,
	description: String,
	city: String,
	comments:[{ type:Schema.ObjectId, ref:"Comment"}],
	creator:{type:Schema.ObjectId, ref:"User"},
	createdTime:{type:Date, default:Date.now}
});

StyleboxSchema.plugin(mongooseAggregatePaginate);

var Stylebox =  mongoose.model('Stylebox', StyleboxSchema);
module.exports = Stylebox;

module.exports.getStyleboxById = function(id, callback){
	Stylebox.findById(id, callback);
}

module.exports.createNewStylebox = function(newStyle, callback){
	newStyle.save(callback);
}
