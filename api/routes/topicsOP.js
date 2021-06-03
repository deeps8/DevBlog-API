const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/checkAuth");
const Topics = require("../models/topics");
const User = require("../models/user");

//adding the topics
router.post('/add',checkAuth,async (req,res,next)=>{

    const tps = []; 
    req.body.forEach(tn => {
        tps.push(tn.topicName);
    });

    try {
        let topicsFound = await Topics.find({topicName:{$in:tps}},"-_id -__v -topicCount").exec();
        let topicsInsert = [];
        
        req.body.forEach(r => {
            if(!topicsFound.find(tf=>tf.topicName == r.topicName)){
                topicsInsert.push(r);
            }
        });
        console.log(topicsInsert);
        if(topicsInsert.length){
            let data = await Topics.insertMany(topicsInsert);
            if(data){
                res.status(200);
                return res.json({
                    message:"Topic added",
                    ok:true,
                    data:data
                });
            }
        }

        res.status(200);
        return res.json({
            message:"No New Topics to add",
            ok:true
        });
        
    } catch (error) {
        res.status(500);
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        });
    }

    
});

// Follow and unfollow the topic
router.post('/follow',checkAuth,async (req,res,next)=>{
    try {
        let data = await User.findOneAndUpdate({uid:req.UserData.uid,followedTopics:{$not:{$eq:req.body.topic}}},{
            $push:{followedTopics:req.body.topic}
        }).exec();    

        if(data!=null){
            let incTopicCount = await Topics.findOneAndUpdate({topicName:req.body.topic},{
                $inc:{topicCount:1}
            }).exec();

            if(incTopicCount!=null){
                res.status(200);
                return res.json({
                    message:"Topic Followed",
                    ok:true
                });
            }
        }

        res.status(500);
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        });

    } catch (error) {
        res.status(500);
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        });
    }
        
});


router.post('/unfollow',checkAuth,async (req,res,next)=>{
    try {
        let data = await User.findOneAndUpdate({uid:req.UserData.uid,followedTopics:{$eq:req.body.topic}},{
            $pull:{followedTopics:req.body.topic}
        }).exec();    
        
        if(data!=null){
            let decTopicCount = await Topics.findOneAndUpdate({topicName:req.body.topic},{
                $inc:{topicCount:-1}
            }).exec();

            if(decTopicCount!=null){
                res.status(200);
                return res.json({
                    message:"Topic Unfollowed",
                    ok:true
                });
            }
        }

        res.status(500);
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        });

    } catch (error) {
        res.status(500);
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        });
    }
        
});

// get topics
router.get("/all",async (req,res,next)=>{

    const { page=1,limit=20,filter="new"} = req.query;
    let sortObj;

    if(filter=="new"){
        sortObj = {dateOfCreation:-1}
    }else{
        sortObj = {topicCount:-1}
    }

    try {
        const result = await Topics.find()
                                .sort(sortObj)
                                .limit(limit*1).skip((page-1)*limit)
                                .exec();
        res.status(200);
        return res.json({
            message:filter+" Topics",
            ok:true,
            total:result.length,
            data:result
        });

    } catch (error) {
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        });
    }

    
});



module.exports = router;