let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let methodOverride = require('method-override');
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
let firebase = require("firebase/app");

// CONFIG

mongoose.connect("mongodb://localhost:27017/augmentx");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

// TODO: Replace the following with your app's Firebase project configuration
var firebaseConfig = {
    apiKey: "AIzaSyD5RZorSvd0Vqho3zr68BbR4ywUrg_z2mM",
    authDomain: "eduar-5dcad.firebaseapp.com",
    databaseURL: "https://eduar-5dcad.firebaseio.com",
    projectId: "eduar-5dcad",
    storageBucket: "eduar-5dcad.appspot.com",
    messagingSenderId: "213508622109",
    appId: "1:213508622109:web:70f5d81eab60b7098d03f4",
    measurementId: "G-X22HCJ8CNL"
};
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  

// MODELS

let userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})

let postSchema = new mongoose.Schema({
    author: String,
    title: String,
    description: String,
    created: {type: Date, default: Date.now}
});

let User = mongoose.model("User", userSchema);
let Post = mongoose.model("Post", postSchema);

// ROUTES

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/new", (req, res) => {
    res.render("register");
});

app.post("/new", (req, res) => {

    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    },(err, user) => {
        if(err)
        {
            console.log("Error registering");
        }
        else 
        {
            console.log("Successful registering");
            res.render("login");
        }
    });

    res.redirect("/");
});

app.get("/posts", (req, res) => {
    Post.find({}, (err, allPosts) => {
        if(err){
            console.log("Error getting posts");
        }
        else {
            res.render("posts", {posts: allPosts});
        }
    });
});

app.get("/posts/new", (req, res) => {
    res.render("newpost");
});

app.post("/posts", (req, res) => {
    Post.create(req.body.post, (err, post) =>{
        if(err)
        {
            console.log("Error posting");
        }
        else
        {
            res.redirect("/posts");
        }
    });
});

// SHOW ROUTE
app.get("/posts/:id", (req, res) => {
    Post.findById(req.params.id, (err, foundPost) => {
        if(err){
            res.redirect("/posts");
        }
        else{
            res.render("posts_show", {post: foundPost})
        }
    })
});

// EDIT ROUTE
app.get("/posts/:id/edit", (req, res) => {
    Post.findById(req.params.id, (err, foundPost) => {
        if(err)
        {
            res.redirect("/posts" + req.param.id);
        }
        else
        {
            res.render("posts_edit", {post: foundPost});
        }
    });
});

//UPDATE ROUTE
app.put("/posts/:id", (req, res) => {
    Post.findByIdAndUpdate(req.params.id, req.body.post, (err, updatedBlog) => {
        if(err)
        {
            res.redirect("/");
        }
        else
        {
            res.redirect("/posts/" + req.params.id);
        }
    });
});

// DELETE ROUTE
app.delete("/posts/:id", (req, res) => {
    // Destroy block
    Post.findByIdAndRemove(req.params.id, (err) =>{
        if(err)
        {
            res.redirect('/posts');
        }
        else
        {
            res.redirect('/posts');
        }
    });
    // Redirect somewhere
});

app.get("/u/:user", (req, res) => {
    let user = req.params.user;
    res.render("home", {user: user});
});

app.get('*', (req, res) => {
    res.send('Wrong route');
});

app.listen(3000, function() {
    console.log('app started on port 3000');
});
