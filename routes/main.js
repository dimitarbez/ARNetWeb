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
            console.log(err);
            return res.render("register.ejs");
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/posts");
        })
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
    res.redirect("/posts");
});

router.get("/", (req, res) => {
    res.redirect("/posts");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}


module.exports = router;