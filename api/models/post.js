const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    pid:{ 
        type:mongoose.Schema.Types.ObjectId
    },
    user:{ 
        uid:{type:mongoose.Schema.Types.ObjectId},
        username:{type:String},
        profileURL:{
            thumbLink:{ 
                type:String
              },
              deleteLink:{
                type:String
              }
        }
    },
    dateOfCreation:{ 
        type:Date,
        default:Date.now
    },
    heading:{type:String},
    coverImg:{
        imgLink:{
            type:String,
            default:null
        },
        deleteLink:{ 
            type:String
        }
    },
    topics:{type:Array},
    postBody:{type:String},
    category:{ 
        typeOfPost:{type:String},
        series:{ 
            sid:{type:mongoose.Schema.Types.ObjectId},
            name:{type:String}
        },
        podcastMedia:{type:String}
    },
    likes:{
        type:Number,
        default:0
    },
    comments:{ 
        type:Number,
        default:0
    }
});

module.exports = mongoose.model('Post',postSchema);