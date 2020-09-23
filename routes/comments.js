// ====================================
// COMMENTS ROUTES
// ====================================

let express = require("express");
let router = express.Router();

let Post = require("../models/post.js");
let Comment = require("../models/comment.js");
let User = require("../models/user.js");

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// we put isLoggedIn as middleware everywhere we need the user to be logged in
router.get("/posts/:id/comments/new", isLoggedIn, (req, res) => {
    // find post by id
    Post.findById(req.params.id, (err, post) => {
        if(err) {
            console.log("can't find post");
        }
        else
        {
            res.render("comments/new.ejs", {post: post});
        }
    });
});

router.post("/posts/:id/comments", isLoggedIn, (req, res) => {
    // lookup campground using id
    Post.findById(req.params.id, (err, post) => {
        if(err) {
            console.log(err);
            res.redirect("/posts");
        }
        else {
            Comment.create(req.body.comment, (err, comment) => {
                if(err) {
                    console.log(err);
                } else {
                    //console.log(comment);
                    post.comments.push(comment);
                    post.save();
                    res.redirect("/posts/" + post._id);
                }
            });
        }
    });
    // create new comment
    // connect new comment to campground
    // redirect to campground showpage
});

module.exports = router;
