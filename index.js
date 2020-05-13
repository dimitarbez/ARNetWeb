let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/augmentx");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


let userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})

let postSchema = new mongoose.Schema({
    author: String,
    title: String,
    description: String
});

let User = mongoose.model("User", userSchema);

let Post = mongoose.model("Post", postSchema);

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

app.get("/posts/new", (err, res) => {

});

app.post("/posts", (err, res) => {

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
