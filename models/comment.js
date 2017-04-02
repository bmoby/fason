var mongoose = require('mongoose');
require('mongo-relation');
var User = require('./user');
var relationship = require("mongoose-relationship");
var Schema = mongoose.Schema;
// Comment Schema


var CommentSchema = mongoose.Schema({
  creator: {type: Schema.ObjectId},
  creatorAva: {type:String},
  creatorName: {type:String},
  foruser: {type: Schema.ObjectId, ref:"User", childPath:"comments"},
  stylebox: {type: Schema.ObjectId, ref:"Stylebox", childPath:"comments"},
  commentBody: {
		type: String,
		required: true
	},
  showDate: {
    type: Date,
    required: true
  },
  createdTime:{type:Date, default:Date.now}
});

CommentSchema.plugin(relationship, { relationshipPathName:'creator', relationshipPathName: 'stylebox'});

var Comment =  mongoose.model('Comment', CommentSchema);
module.exports = Comment;

module.exports.createNewComment = function(newComment, callback){
  var comment = new Comment();
  comment.creator = newComment.creator;
  comment.stylebox = newComment.stylebox;
  comment.foruser = newComment.foruser;
  comment.commentBody = newComment.commentBody;
  comment.showDate = newComment.showDate;
  comment.creatorAva = newComment.creatorAva;
  comment.creatorName = newComment.creatorName;
  comment.save(callback);

}

module.exports.getCommentById = function(id, callback){
	Comment.findById(id, callback);
}
