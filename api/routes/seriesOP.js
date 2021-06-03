const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/checkAuth");
const Series = require("../models/series");
const User = require("../models/user");

//adding a series
router.post('/add/new',checkAuth,async (req,res,next)=>{
    const series = new Series({
        sid  : new mongoose.Types.ObjectId(),
        user : req.UserData,
        name : req.body.seriesName,
        posts : [] 
    });
    try {
        let result = await series.save();
        if(result!=null){
            let incSeries = await User.findOneAndUpdate({uid:req.UserData.uid},{
                $inc:{series:1}
            }).exec();
            if(incSeries!= null){
                res.status(200);
                return res.json({
                    message:"Series Added",
                    ok:true,
                    data: result
                });
            }   
        }
        else{
            res.status(400);
            return res.json({
                message:"Series not Added",
                ok:false
            });
        }    
    } catch (error) {
        res.status(400);
        return res.json({
            message:"Something went wrong Series not Added",
            ok:false
        });
    }
});

// todo: 3.get series for dropdown(post form)
// 1.getting all series
router.get('/all',async (req,res,next)=>{

    const { page=1,limit=10,filter="new"} = req.query;
    let sortObj;

    if(filter=="new"){
        sortObj = {dateOfCreation:-1}
    }else{
        sortObj = {likes:-1,comments:-1}
    }

    try {
        const result = await Series.find()
                                .sort(sortObj)
                                .limit(limit*1).skip((page-1)*limit)
                                .exec();
        res.status(200);
        return res.json({
            message:filter+" Series",
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

// 2.getting all series of a user
router.get('/dashboard/all/user',checkAuth,async (req,res,next)=>{
    const { page=1,limit=10} = req.query;

    try {
        const result = await Series.find({"user.uid":req.UserData.uid})
                                .sort({dateOfCreation:-1})
                                .limit(limit*1).skip((page-1)*limit)
                                .exec();
        res.status(200);
        return res.json({
            message:"Recent series",
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

// 2.getting all series of a user
router.get('/upload/dropdown',checkAuth,async (req,res,next)=>{
    
    try {
        const result = await Series.find({"user.uid":req.UserData.uid},"-user -posts -dateOfCreation").exec();
        
        res.status(200);
        return res.json({
            message:"Recent series",
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