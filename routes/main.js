let express = require("express");
let passport = require("passport");
let router = express.Router();
let Post = require("../models/post.js");
let Comment = require("../models/comment.js");
let User = require("../models/user.js");


// show register form
router.get("/register", (req, res) => {
    res.render("register.ejs");
});
// handle signup logic
router.post("/register", (req, res) => {
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            req.flash("error", err.message);
            console.log(err.message);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, () => {
                req.flash("success", "Successfully registered!");
                res.redirect("/posts");
            })
        }

    });
});

// show login form
router.get("/login", (req, res) => {
    res.render("login.ejs");
});
// passport with authenticate with what we've stored in the database
// user.authenticate is handling this for us
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/posts",
        failureRedirect: "/login"
    }), (req, res) => {
})

// logout route
router.get("/logout", (req, res) => {
    // this comes from packages
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/posts");
});

router.get("/", (req, res) => {
    res.redirect("/posts");
});

module.exports = router;