let express = require("express");
let router = express.Router();
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
let Post = require("../models/post.js");
let Comment = require("../models/comment.js");
let User = require("../models/user.js");
const { auth } = require("firebase");
let middleware = require("../middleware/middleware.js");
const { v4: uuidv4 } = require("uuid");
const { BucketActionToHTTPMethod } = require("@google-cloud/storage/build/src/bucket");
const { model } = require("../models/comment.js");

// CONFIG
const uploader = multer({
	storage: multer.memoryStorage(),
	/*
    limits: {
        // file size limit in MB
        fileSize: 50 * 1024 * 1024
    }
    */
});

const storage = new Storage({
	projectId: "eduar-5dcad",
	keyFilename: "api/services/key.json",
});

const bucket = storage.bucket("gs://eduar-5dcad.appspot.com");

router.get("/posts", (req, res) => {
	Post.find({}, (err, allPosts) => {
		if (err) {
			console.log("Error getting posts");
		} else {
			res.render("posts/posts.ejs", { posts: allPosts });
		}
	});
});

// show post creation form
router.get("/posts/new", middleware.isLoggedIn, (req, res) => {
	res.render("posts/newpost.ejs");
});

// create post
router.post(
	"/posts",
	middleware.isLoggedIn,
	uploader.fields([
		{
			name: "file_to_upload",
			maxCount: 1,
		},
		{
			name: "image_for_model",
			maxCount: 1,
		},
	]),
	async (req, res, next) => {
		let author = {
			id: req.user._id,
			username: req.user.username,
		};

		let newPost = new Post(req.body.post);

		try {
			if (!req.files) {
				res.status(400).send("No file uploaded");
				console.log(req.files);
				return;
			}

			let uuidv4String = uuidv4();
			newPost.description = req.sanitize(req.body.post.description);
			newPost.author = author;
			newPost.uuid = uuidv4String;
			newPost.filename = req.files["file_to_upload"][0].originalname;
			newPost.imgPreviewName = req.files["image_for_model"][0].originalname;

			let modelLocation = "models/" + req.user._id + "/" + uuidv4String + "/";
			const blob = bucket.file(modelLocation + req.files["file_to_upload"][0].originalname);
			const blobImage = bucket.file(modelLocation + req.files["image_for_model"][0].originalname);
			const blobStream = blob.createWriteStream({
				metadata: {
					contentType: req.files["file_to_upload"][0].mimetype,
					metadata: {
						firebaseStorageDownloadTokens: uuidv4String,
					},
				},
			});

			const blobImageStream = blobImage.createWriteStream({
				metadata: {
					contentType: req.files["image_for_model"][0].mimetype,
					metadata: {
						firebaseStorageDownloadTokens: uuidv4String,
					},
				},
			});

			blobStream.on("error", (err) => {
				next(err);
			});

			blobImageStream.on("error", (err) => {
				next(err);
			});

			blobStream.end(req.files["file_to_upload"][0].buffer);
			blobImageStream.end(req.files["image_for_model"][0].buffer);

			blobStream.on("finish", () => { 
                console.log("model upload finished"); 
                Post.create(newPost, (err, post) => {
                    if (err) {
                        console.log("Error posting");
                    } else {
                        res.redirect("/");
                    }
                });
            });
			blobImageStream.on("finish", () => { console.log("image upload finished"); });
		} catch (error) {
			res.status(200).send(`Error, could not upload file: ${error}`);
			return;
		} finally {

		}
	}
);

// SHOW ROUTE
router.get("/posts/:id", (req, res) => {
	// find by id and populate comments based on the array of comnment ids
	// post object now has the comments in it
	Post.findById(req.params.id)
		.populate("comments")
		.exec((err, foundPost) => {
			if (err) {
				res.redirect("/posts");
			} else {
				console.log(foundPost);
				res.render("posts/posts_show", { post: foundPost });
			}
		});
});

// EDIT ROUTE
// middleware is called before route handler
router.get("/posts/:id/edit", middleware.checkPostOwnership, (req, res) => {
	Post.findById(req.params.id, (err, foundPost) => {
		res.render("posts/posts_edit", { post: foundPost });
	});
});

//UPDATE ROUTE
router.put("/posts/:id", middleware.checkPostOwnership, (req, res) => {
	req.body.post.description = req.sanitize(req.body.post.description);
	Post.findByIdAndUpdate(req.params.id, req.body.post, (err, updatedBlog) => {
		if (err) {
			req.flash("success", "Error while updating post!");
			res.redirect("/posts");
		} else {
			req.flash("success", "Post successfully updated!");
			res.redirect("/posts/" + req.params.id);
		}
	});
});

// DELETE ROUTE
router.delete("/posts/:id", middleware.checkPostOwnership, (req, res) => {
	// Destroy block
	Post.findByIdAndRemove(req.params.id, (err, post) => {
		if (err) {
			console.log(err);
			req.flash("error", "Failed to delete post!");
			res.redirect("/posts");
		} else {
			bucket.deleteFiles(
				{
					prefix: "models/" + req.user._id + "/" + post.uuid + "/",
				},
				(err) => {
					if (err) {
						console.log("FIREBASE DELETE ERROR: " + err);
					}
				}
			);
			req.flash("success", "Post successfully deleted!");
			res.redirect("/posts");
		}
	});
	// Redirect somewhere
});

module.exports = router;
