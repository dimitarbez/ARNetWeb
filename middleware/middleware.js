let Post = require("../models/post.js");
let Comment = require("../models/comment.js");
let User = require("../models/user.js");

let middlewareObj = {};

middlewareObj.checkPostOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Post.findById(req.params.id, (err, foundPost) => {
            if (err) {
                req.flash("error", "Post not found!");
                res.redirect("back");
            } else {
                // does user own campground
                if (foundPost.author.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "This is not your post!");
                    res.redirect("back");
                }
            }
        });
    } else {
        // if not, redirect user to previous page
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                req.flash("error", "Comment not found!");
                res.redirect("back");
            } else {
                // does user own campground
                if (foundComment.author.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "This is not your comment!");
                    res.redirect("back");
                }
            }
        });
    } else {
        // if not, redirect user to previous page
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // will only flash on the next page we load or the next thing we see
    // we use flash before we redirect
    // we have to handle this in the /login route
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
};

middlewareObj.isUserSelf = function (req, res, next) {
    if(req.isAuthenticated()) {
        User.findById(req.params.id, (err, foundUser) => {
            if(err) {
                req.flash("error", "Comment not found!");
                res.redirect("back");
            } else {
                if(foundUser._id.equals(req.user._id)) {
                    next()
                } else {
                    req.flash("error", "You are not this user!");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        // if not, redirect user to previous page
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}

module.exports = middlewareObj;
