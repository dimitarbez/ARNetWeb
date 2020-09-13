let mongoose = require("mongoose");

let postSchema = new mongoose.Schema({
    author: String,
    title: String,
    description: String,
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Post", postSchema);
