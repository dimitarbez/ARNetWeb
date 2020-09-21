let mongoose = require("mongoose");

let postSchema = new mongoose.Schema({
    author: String,
    title: String,
    description: String,
    created: {type: Date, default: Date.now},
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Post", postSchema);