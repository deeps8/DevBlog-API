const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  cid: mongoose.Schema.Types.ObjectId,
  postId: { type: String, required: true },
  user: {
    profileURL: { 
      thumbLink:{ 
        type:String
      },
      deleteLink:{
        type:String
      }
     },
    username: { type: String },
    uid: { type: String },
  },
  dateOfCreation: { type: Date, default: Date.now },
  commentBody: { type: String, required: true },
  replies: [
    {
      user: {
        profileURL: { 
          thumbLink:{ 
            type:String
          },
          deleteLink:{
            type:String
          }
         },
        username: { type: String },
        uid: { type: String },
      },
      _id:false,
      replyBody: { type: String },
      dateOfCreation: { type: Date, default: Date.now },
      likes: { type: Number, default: 0 },
    },
  ],
  likes: { type: Number, default: 0 },
});

module.exports = mongoose.model("Comments", commentSchema);
