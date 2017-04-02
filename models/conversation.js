var mongoose = require('mongoose');
var User = require('./user');
var relationship = require("mongoose-relationship");
var Schema = mongoose.Schema;
require('mongo-relation');
// User Schema
var ConversationsSchema = mongoose.Schema({
  messages: [{
      msgTime:Date,
      msg: String,
      msgOwner: String,
      msgOwnerName: String,
      messageCreatedTime: { type : Date, default: Date.now }
  }],
  from: String,
  activeTime: Date,
  participants: [ {type : Schema.ObjectId, ref : 'User'} ],
  conversationCreatedTime: { type : Date, default: Date.now }
});


var Conversations =  mongoose.model('Conversation', ConversationsSchema);
module.exports = Conversations;

module.exports.createNewConversation = function(conversation, callback){
	        conversation.save(callback);
}

module.exports.getConversationById = function(id, callback){
	Conversations.findById(id, callback);
}
