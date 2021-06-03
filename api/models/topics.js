const mongoose = require('mongoose');

const topicSchema = mongoose.Schema({ 
    topicName:{type:String,unique:true},
    topicCount:{type:Number,default:0},
    dateOfCreation:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Topic',topicSchema);
