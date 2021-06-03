const mongoose = require('mongoose');

const seriesSchema = mongoose.Schema({
    sid:{
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
    name:{ 
        type:String,
        required:true
    },
    dateOfCreation:{
        type:Date,
        default:Date.now
    },
    posts:[
        {
            _id:false,
            pid:{type:mongoose.Schema.Types.ObjectId},
            heading:{type:String}
        }
    ]
});

module.exports = mongoose.model('Series',seriesSchema);
