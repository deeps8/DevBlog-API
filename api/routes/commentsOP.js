const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/checkAuth");
const Posts = require("../models/post");
const Comments = require("../models/comment");
const Likes = require("../models/likes");

/**
 * body : post id, comment body 
 */

router.post('/comment',checkAuth,async(req,res,next)=>{

    const comment = new Comments({
        cid : new mongoose.Types.ObjectId(),
        postId : req.body.pid,
        user : req.UserData,
        commentBody : req.body.commentBody
    });

    try {
        let result = await comment.save();
        if(result!=null){
            
            let inc = await Posts.findOneAndUpdate({pid:req.body.pid},{
                $inc:{comments:1}
            }).exec();

            if(inc!=null){
                res.status(200);
                return res.json({
                    message:"Comment added",
                    ok:true,
                    data:result
                });
            }
        }else{
            res.status(400);
            return res.json({
                message:"comment not added",
                ok:false
            });
        }
    } catch (error) {
        res.status(400);
        return res.json({
            message:"Something went wrong",
            ok:false,
            error:error
        });
    }

});

router.post("/reply",checkAuth,async(req,res,next)=>{
    const reply = {
        user:req.UserData,
        replyBody:req.body.replyBody
    };

    try {
        let result = await Comments.findOneAndUpdate({cid:req.body.cid},{
            $push:{replies:reply}
        }).exec();
        
        if(result!=null){
            res.status(200);
            return res.json({
                message:"Reply added",
                ok:true,
                data:result
            });
        }
        res.status(400);
        return res.json({
            message:"Reply not added",
            ok:false
        });
        
    } catch (error) {
        res.status(400);
        return res.json({
            message:"Reply not added",
            ok:false,
            error:error
        });
    }    

});

/**
 * body : post/comment ID, 
 */
router.post("/like",checkAuth,async (req,res,next)=>{
    try {
        const user = {
            uid:req.UserData.uid,
            username:req.UserData.username
        };

        let updatedLikes = await Likes.findOneAndUpdate({pcid:req.body.pcid},{
            $push:{
                users:user
            }
        }).exec();

        if(updatedLikes==null){
            const like = new Likes({
                pcid: req.body.pcid,
                users:[user]
            });

            like.save();
        }
        
        let result;
        if(req.body.type=="post"){
            result = await Posts.findOneAndUpdate({pid:req.body.pcid},{
                $inc:{likes:1}
            }).exec();    
        }else{
            result = await Comments.findOneAndUpdate({cid:req.body.pcid},{
                $inc:{likes:1}
            }).exec();
        }

        if(result==null){
            res.status(400);
            return res.json({
                message:"Something went wrong",
                ok:false
            });
        }
        res.status(200);
        return res.json({
            message:"Liked post",
            ok:true
        });    
    } catch (error) {
        res.status(400);
            return res.json({
                message:"Something went wrong ",
                ok:false
            });
    }
    
});

router.post("/dislike",checkAuth,async (req,res,next)=>{
    try {

        let updatedLikes = await Likes.findOneAndUpdate({pcid:req.body.pcid},{
            $pull:{
                users:{uid:req.UserData.uid}
            }
        }).exec();

        let result;
        if(req.body.type=="post"){
            result = await Posts.findOneAndUpdate({pid:req.body.pcid},{
                $inc:{likes:-1}
            }).exec();    
        }else{
            result = await Comments.findOneAndUpdate({cid:req.body.pcid},{
                $inc:{likes:-1}
            }).exec();
        }

        if(result==null){
            res.status(400);
            return res.json({
                message:"Something went wrong",
                ok:false
            });
        }
        res.status(200);
        return res.json({
            message:"disliked post",
            ok:true
        });    
    } catch (error) {
        res.status(400);
            return res.json({
                message:"Something went wrong",
                ok:false
            });
    }
    
});

module.exports = router;