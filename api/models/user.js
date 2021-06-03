const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  uid: { type: mongoose.Schema.Types.ObjectId },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String, 
    required: true, 
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password:{
    type:String,
    required: true
  },
  profileURL:{
    thumbLink:{ 
      type:String,
      default:'uploads/default_user.png'
    },
    deleteLink:{
      type:String
    }
  },
  dateOfCreation:{
    type:Date,
    default:Date.now
  },
  followedTopics:[
    {type:String}
  ],
  followedUsers:{
    type:Number,
    default: 0
  },
  followers:{
    type:Number,
    default: 0
  },
  posts:{
    type:Number,
    default: 0
  },
  series:{
    type:Number,
    default: 0
  },
  podcasts:{ 
    type: Number,
    default: 0
  },
  userDetails:{
    bio:{type:String},
    location:{type:String},
    websiteURL:{type:String},
    githubURL:{type:String}
  }

});

module.exports = mongoose.model("User", userSchema);
