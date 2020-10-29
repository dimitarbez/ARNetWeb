let express = require("express");
let router = express.Router();
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
let Post = require("../models/post.js");
let Comment = require("../models/comment.js");
let User = require("../models/user.js");
const { auth } = require("firebase");
let middleware = require("../middleware/middleware.js");
const { v4: uuidv4 } = require("uuid");
const { BucketActionToHTTPMethod } = require("@google-cloud/storage/build/src/bucket");
const { model } = require("../models/comment.js");

// GET ROUTE
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err){
            console.log(err);
        }
        else{
            Post.find({ author: { id: foundUser._id, username: foundUser.username } }, (err, foundPosts) => {
                if(err){
                    console.log(err);
                }
                else{
                    console.log(foundPosts);
                    res.render("users/users_show.ejs", {user: foundUser, posts: foundPosts});
                }
            });
        }
    });
});

// UPDATE ROUTE
router.put("/users/:id", middleware.isUserSelf, (req, res) => {
    req.body.user.aboutme = req.sanitize(req.body.user.aboutme);
    User.findByIdAndUpdate(req.params.id, req.body.user, (err, updatedUser) => {
        if (err) {
			req.flash("success", "Error while updating user!");
		} else {
			req.flash("success", "User successfully updated!");
        }
        res.redirect("/users/" + req.params.id);
    });
});

// EDIT ROUTE
router.get("/users/:id/edit", middleware.isUserSelf, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err){
            console.log(err);
        }
        else{
            res.render("users/users_edit.ejs", {user: foundUser});
        }
    });
});

module.exports = router;
