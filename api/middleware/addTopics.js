const Series = require("../models/series");
const Topics = require("../models/topics");

module.exports = async (req,res,next)=>{

    const tps = []; 
    req.body.topics.forEach(tn => {
        tps.push(tn.topicName);
    });

    try {

        // push the postID,heading to series with sid
        if(req.body.category.typeOfPost=="Series"){
            const sp = {pid:req.PostData.pid,heading:req.PostData.heading};
            let postSeries = await Series.findOneAndUpdate({sid:req.body.category.series.sid},{
                $push:{posts:sp}
            }).exec();
            
            if(postSeries==null){
                res.status(500);
                return res.json({
                    message:"Something went wrong (addTopics)",
                    ok:false,
                    error:error
                });
            }
        }

        let topicsFound = await Topics.find({topicName:{$in:tps}},"-_id -__v -topicCount").exec();
        let topicsInsert = [];
        
        req.body.topics.forEach(r => {
            if(!topicsFound.find(tf=>tf.topicName == r.topicName)){
                topicsInsert.push(r);
            }
        });
        
        if(topicsInsert.length){
            let data = await Topics.insertMany(topicsInsert);
            if(data != null){
                req.topicAdded = true;
            }
        }
        req.topicAdded = false;
        next();        
    } catch (error) {
        res.status(500);
        return res.json({
            message:"Something went wrong (addTopics)",
            ok:false,
            error:error
        });
    }

    
}