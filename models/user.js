let mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose");

let userSchema = mongoose.Schema({
    username: String,
    password: String
});

// adds passport methods to user
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);