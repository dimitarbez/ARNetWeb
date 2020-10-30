const mongoose = require('mongoose');

let commentSchema = mongoose.Schema({
    text: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    created: {type: Date, default: Date.now},
})

module.exports = mongoose.model("Comment", commentSchema);