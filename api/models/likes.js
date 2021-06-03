const mongoose = require('mongoose');

const likesSchema = mongoose.Schema({ 
    pcid:{
        type:mongoose.Schema.Types.ObjectId
    },
    users:[
        {
                _id:false,
                uid:{type:mongoose.Schema.Types.ObjectId},
                username:{type:String}
        }
    ]
});

module.exports = mongoose.model('Likes',likesSchema);