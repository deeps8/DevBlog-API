const mongoose = require('mongoose');

const followerSchema = mongoose.Schema({
    fid:{ 
        type:mongoose.Schema.Types.ObjectId
    },
    fname:{type:String},
    follower:[
        {
            _id:false,
            uid:{type:String},
            username:{type:String}
        }
    ]
});

module.exports = mongoose.model('Followers',followerSchema)