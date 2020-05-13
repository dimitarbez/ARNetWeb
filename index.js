let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

// CONFIG

mongoose.connect("mongodb://localhost:27017/augmentx");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

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
