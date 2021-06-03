const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const addTopics = require("../middleware/addTopics");
const checkAuth = require("../middleware/checkAuth");
const env_var = require("../../config");
const imgbb = require("imgbb-uploader");
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require("../models/user");
const authPost = require("../middleware/authPost");
const Likes = require("../models/likes");
const Series = require("../models/series");


//adding the post
/**
 * Checkauth --> the post data to save --> add new topics to db
 * auth : token
 * body : heading , coverimg(base64) , default(for img) , topics , category ,(if a series{name,sid}) , body
 */
router.post("/add",checkAuth,async(req,res,next)=>{
    // first upload the cover img
    let imgLink = null, deleteLink = null;
    try {
        if(!req.body.default){
            const options = {
                apiKey : env_var.imgbb_key,
                name: Date.now(),
                base64string: req.body.coverImg
            };
    
            const imageData = await imgbb(options);
                imgLink = imageData.display_url;
                deleteLink = imageData.delete_url;
        }

            const post = new Post({
                    pid : new mongoose.Types.ObjectId(),
                    user : req.UserData,
                    heading : req.body.heading,
                    coverImg : {
                        imgLink : imgLink,
                        deleteLink : deleteLink
                    },
                    topics : req.body.topics,
                    postBody : req.body.postBody,
                    category : req.body.category
            });
            try {
                let result = await post.save();
                if(result==null){
                    res.status(400);
                    return res.json({
                        message:"Something went wrong while uploading post",
                        ok:false
                    });
                }
                req.PostData = result;

                let incPost = User.findOneAndUpdate({uid:req.UserData.uid},{
                    $inc:{posts:1}
                }).exec();

                if(incPost==null){
                    res.status(400);
                    return res.json({
                        message:"Something went wrong while Increasing post count",
                        ok:false
                    });
                }

            } catch (error) {
                res.status(400);
                return res.json({
                    message:"Something went wrong (postsave)",
                    ok:false,
                    error:error
                });
            }
        
    } catch (error) {
        res.status(400);
        return res.json({
            message:"Something went wrong ( PostOp )",
            ok:false,
            error:error
        });
    }
    next();
},addTopics,(req,res,next)=>{
    if(req.topicAdded){
        res.status(200);
        return res.json({
            message:"Topics and Post are added",
            ok:true,
            data:req.PostData
        });
    }else{
        res.status(200);
        return res.json({
            message:"No New Topics to add and Post uploaded",
            ok:true,
            data:req.PostData
        });
    }
});


/**
 * todo : 1. get all posts with limit
 * todo : 2. get posts of user
 * todo : 3. get all discussions
 * todo : 3. update the posts (later)
 */

// get all posts dashboard (of a user)
router.get('/dashboard/all',checkAuth,async (req,res,next)=>{

    const { page=1,limit=10} = req.query;
    
    try {
        let p = await Post.find({"user.uid":req.UserData.uid},"-_id -body")
                    .sort({dateOfCreation:-1})
                    .limit(limit*1).skip((page-1)*limit)
                    .exec();

        res.status(200);
        return res.json({
            message:"Recent Posts",
            ok:true,
            total:p.length,
            data:p
        });    
    } catch (error) {
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        });
    }
                    

});

// get all posts with limit/skip
router.get('/all',async (req,res,next)=>{

    const { page=1,limit=10,filter="new"} = req.query;
    let sortObj;

    if(filter=="new"){
        sortObj = {dateOfCreation:-1}
    }else{
        sortObj = {likes:-1,comments:-1}
    }

    try {
        let p = await Post.find({},"-_id -body")
                    .sort(sortObj)
                    .limit(limit*1).skip((page-1)*limit)
                    .exec();

        res.status(200);
        return res.json({
            message: filter+" Posts",
            ok:true,
            total:p.length,
            data:p
        });    
    } catch (error) {
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        });
    }
                    

});


// get all discussions with limit/skip
router.get('/discusion/all',async (req,res,next)=>{

    const { page=1,limit=10,filter="new"} = req.query;
    let sortObj;

    if(filter=="new"){
        sortObj = {dateOfCreation:-1}
    }else{
        sortObj = {likes:-1,comments:-1}
    }

    try {
        let p = await Post.find({"category.typeOfPost":"discussion"},"-_id -body")
                    .sort(sortObj)
                    .limit(limit*1).skip((page-1)*limit)
                    .exec();

        res.status(200);
        return res.json({
            message: filter+" Discussions",
            ok:true,
            total:p.length,
            data:p
        });    
    } catch (error) {
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        });
    }
                    
});

// get a post with series list(if any), comments and replies with limit skip
router.get('/one',authPost,async (req,res,next)=>{
    let page = req.body.commentPage,s=null;
    try {
        let p = await Post.findOne({pid:req.body.pid}).exec();

        if(p.category.typeOfPost=='Series'){
            s = await Series.findOne({"posts.pid":p.pid},"-user").exec();
        }
            

        if(p!=null){
            const c = await Comment.find({postId:req.body.pid})
                                .sort({dateOfCreation:-1})
                                .limit(20*1).skip((page-1)*20)
                                .exec();
            let cids = [];
            c.forEach(el => {
                cids.push(mongoose.Types.ObjectId(el.cid));
            });

            if(req.UserData!=null){
                let pl = await Likes.findOne({pcid:req.body.pid,"users.uid":{$eq:req.UserData.uid}})
                                    .countDocuments()
                                    .exec();
                
                let cl = await Likes.find({pcid:{$in:cids},"users.uid":{$eq:req.UserData.uid}},"-_id -users -__v")
                                    .exec();
                
                res.status(200);
                return res.json({
                    message:"Post",
                    ok:true,
                    post:p,
                    commentLiked:cl,
                    comment:c,
                    postLiked:pl,
                    series:s    
                });
            }
            res.status(200);
            return res.json({
                message:"Post",
                ok:true,
                post:p,
                comment:c    
            });
        }
    } catch (error) {
        res.status(400);
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        })
    }

});


module.exports = router;