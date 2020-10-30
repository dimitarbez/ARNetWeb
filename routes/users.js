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
        fileSize: 5 * 1024 * 1024
    }
});

const storage = new Storage({
	projectId: "eduar-5dcad",
	keyFilename: "api/services/key.json",
});

const bucket = storage.bucket("gs://eduar-5dcad.appspot.com");

// GET ROUTE
router.get("/users", (req, res) => {
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		User.find({$or: [
            {username: regex},
            {fullname: regex},
            {email: regex},
        ]}, (err, foundUsers) => {
			if (err) {
				console.log(err);
			} else {
				res.render("users/users.ejs", { users: foundUsers, navSearchDestination: "/users" });
			}
		});
	} else {
		User.find({}, (err, allUsers) => {
			if (err) {
				console.log(err);
			} else {
				res.render("users/users.ejs", { users: allUsers, navSearchDestination: "/users" });
			}
		});
	}
});

// SHOW ROUTE
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err){
            console.log(err);
        }
        else{
            Post.find({ author: foundUser._id }).populate("author").exec( (err, foundPosts) => {
                if(err){
                    console.log(err);
                }
                else{
                    res.render("users/users_show.ejs", {user: foundUser, posts: foundPosts});
                }
            });
        }
    });
});

// UPDATE ROUTE
router.put("/users/:id", middleware.isUserSelf, uploader.single("profile_picture"), 
async (req, res, next) => {
    console.log("arrived");
    try {
        if(!req.file) {
            
            req.body.user.aboutme = req.sanitize(req.body.user.aboutme);
            User.findByIdAndUpdate(req.params.id, req.body.user, (err, updatedUser) => {
                if (err) {
                    console.log(err);
                    req.flash("success", "Error while updating user!");
                } else {
                    req.flash("success", "User successfully updated!");
                }
                res.redirect("/users/" + req.params.id);
            });

            return;
        }

        let uuidv4String = uuidv4();

        let pictureLocation = "images/" + req.user._id + "/" + uuidv4String + "/";
        const blob = bucket.file(pictureLocation + req.file.originalname);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
                metadata: {
                    firebaseStorageDownloadTokens: uuidv4String,
                },
            }
        });

        blobStream.on("error", (err) => {
            next(err);
        });

        blobStream.end(req.file.buffer);
        blobStream.on("finish", () => { 
            console.log("model upload finished");
            
            let updatedUser = {
                profilepic: req.file.originalname,
                fullname: req.body.user.fullname,
                email: req.body.user.email,
                aboutme: req.sanitize(req.body.user.aboutme),
                uuid: uuidv4String
            };
            
            console.log(updatedUser);

            User.findByIdAndUpdate(req.user._id, { $set: updatedUser }, (err, post) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "Error while updating user!");
                } else {
                    req.flash("success", "User successfully updated!");
                }
                res.redirect("/users/" + req.user._id);
            });
        });

    }
    catch (error) {
        console.log(err);
        req.flash("success", "Error while updating user!");
        res.redirect("/users/" + req.user._id);
    }
});

// EDIT ROUTE
router.get("/users/:id/edit", middleware.isUserSelf, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err){
            console.log(err);
        }
        else{
            res.render("users/users_edit.ejs", {user: foundUser});
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
