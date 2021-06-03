const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const imgbb = require("imgbb-uploader");

const env_var = require("../../config");
const User = require("../models/user");
const Followers = require("../models/followers");
const checkAuth = require("../middleware/checkAuth");

// register route
/**
 * body: { username,email,password,imageBase64,default(bool) }
 */
router.post("/register", (req, res, next) => {
  User.find({ username: req.body.username })
    .countDocuments()
    .exec()
    .then((userCount) => {
      var thumbImg, delImg;
      thumbImg = "https://i.ibb.co/7NyZdXm/default-user.png";
      delImg = "";

      if (userCount == 0) {
        var pass = bcrypt.hashSync(req.body.password, 8);

        if (!req.body.default) {
          const options = {
            apiKey: env_var.imgbb_key,
            name: req.body.username,
            base64string: req.body.profileImg,
          };

          imgbb(options)
            .then((imgData) => {
              thumbImg = imgData.thumb.url;
              delImg = imgData.delete_url;

              const user = new User({
                uid: new mongoose.Types.ObjectId(),
                username: req.body.username,
                email: req.body.email,
                password: pass,
                profileURL: {
                  thumbLink: thumbImg,
                  deleteLink: delImg,
                },
              });

              user
                .save()
                .then((response) => {
                  res.status(200);
                  return res.json({
                    message: "Registration Complete",
                    data: response,
                    ok: true,
                  });
                })
                .catch((err) => {
                  res.status(400);
                  return res.json({
                    message: "Email already exists",
                    data: err,
                    ok: false,
                  });
                });
            })
            .catch((error) => {
              res.status(400);
              return res.json({
                message: "Something went wrong while uploading profile image",
                error: error,
                ok: false,
              });
            });
        } else {
          const user = new User({
            uid: new mongoose.Types.ObjectId(),
            username: req.body.username,
            email: req.body.email,
            password: pass,
            profileURL: {
              thumbLink: thumbImg,
              deleteLink: delImg,
            },
          });

          user
            .save()
            .then((response) => {
              res.status(200);
              return res.json({
                message: "Registration Complete",
                data: response,
                ok: true,
              });
            })
            .catch((err) => {
              res.status(400);
              return res.json({
                message: "Email already exists",
                data: err,
                ok: false,
              });
            });
        }
      } else {
        res.status(400);
        return res.json({
          message: "User Already exists",
          data: err,
          ok: false,
        });
      }
    })
    .catch((err) => {
      res.status(400);
      return res.json({
        message: "User Already exists",
        data: err,
        ok: false,
      });
    });
});

// login user into app
/**
 * body : username,password
 */

router.post("/login", (req, res, next) => {
  User.findOne({ username: req.body.username })
    .exec()
    .then((userDetails) => {
      if (userDetails != null) {
        if (bcrypt.compareSync(req.body.password, userDetails.password)) {
          var token = jwt.sign(
            {
              username: userDetails.username,
              uid: userDetails.uid,
              email: userDetails.email,
              profileURL: userDetails.profileURL
            },
            "mysecretjwtstringfordevblogapp"
          );

          res.status(200);
          return res.json({
            message: "Authentication Successful",
            ok: true,
            token: token,
            user: {
              uid: userDetails.uid,
              username: userDetails.username,
              email: userDetails.email,
              profileURL: userDetails.profileURL,
            },
          });
        } else {
          res.status(400);
          return res.json({
            message: "Authentication Failed",
            ok: false,
          });
        }
      } else {
        res.status(404);
        return res.json({
          message: "No User found",
          ok: false,
        });
      }
    })
    .catch((error) => {
      res.status(400);
      return res.json({
        message: "Something went wrong",
        error: error,
        ok: false,
      });
    });
});

// get a user data
router.get("/details", checkAuth, (req, res, next) => {
  User.findOne({ uid: req.UserData.uid }, "-password")
    .exec()
    .then((userDetails) => {
      if (userDetails != null) {
        res.status(200);
        return res.json({
          message: "User found",
          ok: true,
          data: userDetails,
        });
      } else {
        res.status(404);
        return res.json({
          message: "User not found",
          ok: false,
          error: error,
        });
      }
    })
    .catch((error) => {
      res.status(404);
      return res.json({
        message: "User not found",
        ok: false,
        error: error,
      });
    });
});

// following users
router.post("/follow", checkAuth, async function (req, res, next) {
  let toInc = false;

  const follower = Object({
    uid: req.UserData.uid,
    username: req.UserData.username,
  });

  try {
    var count = await Followers.findOne({ fid: req.body.followeeId })
      .countDocuments()
      .exec();

    if (count == 0) {

    //   console.log("New follower");
      const fwee = new Followers({
        fid: req.body.followeeId,
        fname: req.body.fname,
        follower: [follower],
      });

      fwee.save();
      toInc = true;

    } else {

      try {
        // console.log("not new follower");
        let qf = await Followers.findOneAndUpdate(
          {
            fid: req.body.followeeId,
            "follower.uid": { $not: { $eq: req.UserData.uid } },
          },
          {
            $push: {
              follower: follower,
            },
          }
        ).exec();

        if (qf != null) {
          toInc = true;
        }
      } catch (error) {
        res.status(400);
        return res.json({
          message: "Something Went wrong while pushing",
          ok: false,
        });
      }
    }

    // console.log("default : ", toInc);
    if (toInc) {
      User.findOneAndUpdate(
        { uid: req.UserData.uid },
        {
          $inc: { followedUsers: 1 },
        }
      ).exec();
      User.findOneAndUpdate(
        { uid: req.body.followeeId },
        {
          $inc: { followers: 1 },
        }
      ).exec();

      res.status(200);
      return res.json({
        message: "Followed the user",
        ok: true,
      });
    } else {
      res.status(400);
      return res.json({
        message: "User Already followed",
        ok: false,
      });
    }
  } catch (error) {
    res.status(400);
    return res.json({
      message: "Something Went wrong",
      ok: false,
    });
  }
});


// unfollow user
router.post("/unfollow", checkAuth, (req, res, next) => {
  Followers.findOneAndUpdate(
    { fid: req.body.followeeId , "follower.uid": {$eq: req.UserData.uid }},
    {
      $pull: {
        follower: { uid: req.UserData.uid },
      },
    }
  )
    .exec()
    .then((result) => {
      if (result != null) {
        User.findOneAndUpdate(
          { uid: req.UserData.uid },
          {
            $inc: { followedUsers: -1 },
          }
        ).exec();
        User.findOneAndUpdate(
          { uid: req.body.followeeId },
          {
            $inc: { followers: -1 },
          }
        ).exec();

        res.status(200);
        return res.json({
          message: "Unfollowed the user",
          ok: true,
          data: result,
        });
      } else {
        res.status(400);
        return res.json({
          message: "user not found",
          ok: false,
          data: result,
        });
      }
    })
    .catch((error) => {
      res.status(400);
      return res.json({
        message: "Something went wrong",
        ok: false,
        error: error,
      });
    });
});



// get user followers
router.get('/followers',checkAuth,(req,res,next)=>{
    
    Followers.findOne({fid:req.UserData.uid})
            .exec()
            .then(followers=>{
                if(followers != null){
                    res.status(200);
                    return res.json({
                        message:"User Followers",
                        ok:true,
                        data:followers.follower
                    });
                }else{
                    res.status(404);
                    return res.json({
                        message:"Followers not found",
                        ok:false,
                    });
                }
                
            })
            .catch(error=>{
                res.status(404);
                return res.json({
                    message:"User not found",
                    ok:false,
                    error:error
                });
            });
    
});


//get users he/she followed
router.get('/followedUsers',checkAuth,(req,res,next)=>{
    Followers.find({"follower.uid":{$eq: req.UserData.uid }},"-follower -_id -__v")
            .exec()
            .then(followedUsers=>{
                if(followedUsers.length){
                    res.status(200);
                    return res.json({
                        message:"Followed users found",
                        ok:true,
                        data:followedUsers
                    });
                }
                else{
                    res.status(404);
                    return res.json({
                        message:"Followed users not found",
                        ok:false
                    });
                }
            })
            .catch(error=>{
                res.status(404);
                return res.json({
                    message:"User not found",
                    ok:false,
                    error:error
                });
            });

});


router.post('/add/details',checkAuth,async (req,res,next)=>{
  try {
    let ud = await User.findOneAndUpdate({uid:req.UserData.uid},{
      $set:{
        userDetails:req.body
      }});

      res.status(200);
      return res.json({
        message:"Updated the userdetails",
        ok:true
      });

  } catch (error) {
      res.status(400);
      return res.json({
        message:"Something went wrong",
        ok:false,
        error:error
      });
  }
});


router.get('/details',checkAuth,async (req,res,next)=>{
  try {
    let ud = await User.findOne({uid:req.UserData.uid});

      res.status(200);
      return res.json({
        message:"user Details",
        ok:true,
        user:ud
      });

  } catch (error) {
      res.status(400);
      return res.json({
        message:"Something went wrong",
        ok:false,
        error:error
      });
  }
});

module.exports = router;
