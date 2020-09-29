let express = require("express");
let router = express.Router();
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
let Post = require("../models/post.js");
let Comment = require("../models/comment.js");
let User = require("../models/user.js");
const { auth } = require("firebase");
let middleware = require("../middleware/middleware.js");

// CONFIG
const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        // file size limit in MB
        fileSize: 25 * 1024 * 1024
    }
});

const storage = new Storage({
    projectId: 'eduar-5dcad',
    keyFilename: 'api/services/key.json',
});

const bucket = storage.bucket('gs://eduar-5dcad.appspot.com');

router.get("/posts", (req, res) => {
    Post.find({}, (err, allPosts) => {
        if(err){
            console.log("Error getting posts");
        }
        else {
            res.render("posts/posts.ejs", {posts: allPosts});
        }
    });
});

// show post creation form
router.get("/posts/new", middleware.isLoggedIn, (req, res) => {
    res.render("posts/newpost.ejs");
});

// create post
router.post("/posts", middleware.isLoggedIn, uploader.single('file_to_upload'), async (req, res, next) => {
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

        let author = {
            id: req.user._id,
            username: req.user.username
        }

        req.body.post.description = req.sanitize(req.body.post.description);
        req.body.post.author = author;
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
router.get("/posts/:id", (req, res) => {
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
// middleware is called before route handler
router.get("/posts/:id/edit", middleware.checkPostOwnership, (req, res) => {
    Post.findById(req.params.id, (err, foundPost) => {
        res.render("posts/posts_edit", {post: foundPost});
    });
});

//UPDATE ROUTE
router.put("/posts/:id", middleware.checkPostOwnership, (req, res) => {
    req.body.post.description = req.sanitize(req.body.post.description);
    Post.findByIdAndUpdate(req.params.id, req.body.post, (err, updatedBlog) => {
        if(err)
        {
            req.flash("success", "Error while updating post!");
            res.redirect("/posts");
        }
        else
        {
            req.flash("success", "Post successfully updated!");
            res.redirect("/posts/" + req.params.id);
        }
    });
});

// DELETE ROUTE
router.delete("/posts/:id", middleware.checkPostOwnership, (req, res) => {
    // Destroy block
    Post.findByIdAndRemove(req.params.id, (err) =>{
        if(err)
        {
            console.log(err)
            req.flash("error", "Failed to delete post!");
            res.redirect('/posts');
        }
        else
        {
            req.flash("success", "Post successfully deleted!");
            res.redirect('/posts');
        }
    });
    // Redirect somewhere
});

module.exports = router;