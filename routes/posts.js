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
    limits: {
        // file size limit in MB
        fileSize: 50 * 1024 * 1024
    }
});

const storage = new Storage({
	projectId: "eduar-5dcad",
	keyFilename: "api/services/key.json",
});

const bucket = storage.bucket("gs://eduar-5dcad.appspot.com");

router.get("/posts", (req, res) => {
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Post.find({title: regex}).populate("author").exec((err, allPosts) => {
			if (err) {
				console.log("Error getting posts");
			} else {
				res.render("posts/posts.ejs", { posts: allPosts, navSearchDestination: "/posts" });
			}
		});
	} else {
		Post.find({}).populate("author").exec((err, allPosts) => {
			if (err) {
				console.log("Error getting posts");
			} else {
				res.render("posts/posts.ejs", { posts: allPosts, navSearchDestination: "/posts" });
			}
		});
	}
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
		// set timeout to 10 mins
		req.socket.setTimeout(10 * 60 * 1000);

		let author = req.user._id;
		let newPost = new Post(req.body.post);

		try {
			let uuidv4String = uuidv4();
			let modelLocation = "models/" + req.user._id + "/" + uuidv4String + "/";

			if (req.files["image_for_model"]) {
				newPost.imgPreviewName = req.files["image_for_model"][0].originalname;
				const blobImage = bucket.file(modelLocation + req.files["image_for_model"][0].originalname);

				const blobImageStream = blobImage.createWriteStream({
					metadata: {
						contentType: req.files["image_for_model"][0].mimetype,
						metadata: {
							firebaseStorageDownloadTokens: uuidv4String,
						},
					},
				});

				blobImageStream.on("error", (err) => {
					next(err);
				});

				blobImageStream.end(req.files["image_for_model"][0].buffer);

				blobImageStream.on("finish", () => {});
			}

			newPost.description = req.sanitize(req.body.post.description);
			newPost.author = author;
			newPost.uuid = uuidv4String;
			newPost.filename = req.files["file_to_upload"][0].originalname;

			const blob = bucket.file(modelLocation + req.files["file_to_upload"][0].originalname);

			const blobStream = blob.createWriteStream({
				metadata: {
					contentType: req.files["file_to_upload"][0].mimetype,
					metadata: {
						firebaseStorageDownloadTokens: uuidv4String,
					},
				},
			});

			blobStream.on("error", (err) => {
				next(err);
			});



			blobStream.end(req.files["file_to_upload"][0].buffer);

			blobStream.on("finish", () => { 
				console.log("Finished Upload");
				Post.create(newPost, (err, post) => {
					if (err) {
						console.log(err);
						res.redirect("back");
					} else {
						//req.flash("primary", "Model is being uploaded in the background!");
						res.redirect("/posts/" + post._id);
					}
				});
			});
			
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
		.populate({
			path: "comments",
			populate: {
				path: "author"
			}
		})
		.populate("author")
		.exec((err, foundPost) => {
			console.log(foundPost);
			if (err) {
				console.log(err);
				res.redirect("back");
			} else {
				res.render("posts/posts_show", { post: foundPost });
			}
		});
});

// EDIT ROUTE
// middleware is called before route handler
router.get("/posts/:id/edit", middleware.checkPostOwnership, (req, res) => {

	Post.findById(req.params.id, (err, foundPost) => {
		if(err) {
			console.error(err);
		}
		else {
			res.render("posts/posts_edit", { post: foundPost });
		}
	});
});

//UPDATE ROUTE
router.put("/posts/:id", middleware.checkPostOwnership, (req, res) => {
	req.body.post.description = req.sanitize(req.body.post.description);
	Post.findByIdAndUpdate(req.params.id, req.body.post, (err, updatedBlog) => {
		if (err) {
			req.flash("success", "Error while updating post!");
			console.log(err);
			res.redirect("back");
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
			res.redirect("back");
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
