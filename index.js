let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let methodOverride = require('method-override');
let expressSanitizer = require('express-sanitizer');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
let Post = require("./models/post.js");
let Comment = require("./models/comment.js");
let seedDB = require("./seeds.js");

seedDB();

// CONFIG
const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024
    }
});

const storage = new Storage({
    projectId: 'eduar-5dcad',
    keyFilename: 'api/services/key.json',
});

const bucket = storage.bucket('gs://eduar-5dcad.appspot.com');

mongoose.connect("mongodb://localhost:27017/augmentx");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
// express sanitizer must be after body parser
app.use(expressSanitizer());

// MODELS

let userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
})

let User = mongoose.model("User", userSchema);

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
            res.render("posts/posts.ejs", {posts: allPosts});
        }
    });
});

app.get("/posts/new", (req, res) => {
    res.render("posts/newpost.ejs");
});

// create route
app.post("/posts", uploader.single('file_to_upload'), async (req, res, next) => {
    try{
        if(!req.file){
            res.status(400).send('No file uploaded');
            return;
        }
        console.log(req.file);
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error', err => {
            next(err);
        });

        blobStream.on('finish', () => {
        
                // Assemble the file public URL
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(blob.name)}?alt=media`;
            // Return the file name and its public URL
            // for you to store in your own database
            res.status(200).send({ 
                fileName: req.file.originalname,
                fileLocation: publicUrl
            });

            console.log('finished');

        });

        blobStream.end(req.file.buffer);

        req.body.post.description = req.sanitize(req.body.post.description);
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
    }
    catch(error) {
        res.status(200).send(
            `Error, could not upload file: ${error}`
        );
        return;
    }

});

// SHOW ROUTE
app.get("/posts/:id", (req, res) => {
    // find by id and populate comments based on the array of comnment ids
    // post object now has the comments in it
    Post.findById(req.params.id).populate("comments").exec( (err, foundPost) => {
        if(err){
            res.redirect("/posts");
        }
        else{
            console.log(foundPost);
            res.render("posts/posts_show", {post: foundPost})
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
            res.render("posts/posts_edit", {post: foundPost});
        }
    });
});

//UPDATE ROUTE
app.put("/posts/:id", (req, res) => {
    req.body.post.description = req.sanitize(req.body.post.description);
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

// ====================================
// COMMENTS ROUTES
// ====================================

app.get("/posts/:id/comments/new", (req, res) => {
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

app.post("/posts/:id/comments", (req, res) => {
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
