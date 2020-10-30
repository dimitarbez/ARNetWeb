// ====================================
// COMMENTS ROUTES
// ====================================

let express = require("express");
let router = express.Router();
let middleware = require("../middleware/middleware.js");

let Post = require("../models/post.js");
let Comment = require("../models/comment.js");
let User = require("../models/user.js");


// render comments form
router.get("/posts/:id/comments/new", middleware.isLoggedIn, (req, res) => {
    // find post by id
    Post.findById(req.params.id, (err, post) => {
        if(err) {
            console.log(err);
            res.redirect("back");
        }
        else
        {
            res.render("comments/new.ejs", {post: post});
        }
    });
});

// create comment
router.post("/posts/:id/comments", middleware.isLoggedIn, (req, res) => {
    // lookup campground using id
    Post.findById(req.params.id, (err, post) => {
        if(err) {
            console.log(err);
            res.redirect("back");
        }
        else {
            Comment.create(req.body.comment, (err, comment) => {
                if(err) {
                    console.log(err);
                } else {
                    //console.log(comment);
                    // add username and id to comment
                    comment.author = req.user._id;
                    // save comment
                    comment.save();
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

// COMMENTS EDIT ROUTE
router.get("/posts/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    let postId = req.params.id;
    Comment.findById(req.params.comment_id, (err, foundComment) =>{
        if(err) {
            console.log(err);
            res.redirect("back");
        }
        else {
            res.render("comments/comments_edit.ejs", {post_id: postId, comment: foundComment});
        }
    })
});

// COMMENTS UPDATE ROUTE
router.put("/posts/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if(err) {
            console.log(err);
            res.redirect("back");
        }
        else {
            console.log(updatedComment);
            req.flash("success", "Comment successfully updated!");
            res.redirect("/posts/" + req.params.id);
        }
    })
});

// COMMENTS DESTROY ROUTE
router.delete("/posts/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "Comment successfully deleted!");
            res.redirect("/posts/" + req.params.id);
        }
    })
})

module.exports = router;
