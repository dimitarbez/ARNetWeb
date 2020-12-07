require('dotenv').config();

let express = require('express');
var http = require('http');
var enforce = require('express-sslify');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let methodOverride = require('method-override');
let expressSanitizer = require('express-sanitizer');
let seedDB = require("./seeds.js");
let passport = require("passport");
let LocalStrategy = require("passport-local");
let middleware = require("./middleware/middleware.js");
// flash is for using html notifications for users when they do login or logout or other tasks
let flash = require("connect-flash");
let Post = require("./models/post.js");
let Comment = require("./models/comment.js");
let User = require("./models/user.js");

let commentRoutes = require("./routes/comments.js");
let postRoutes = require("./routes/posts.js");
let mainRoutes = require("./routes/main.js");
let userRoutes = require("./routes/users.js");

//seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Zivio je drug tito megju namas!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
//authenticate() comes from passportlocalmongoose
passport.use(new LocalStrategy(User.authenticate()));
// serialize functions also come from passportlocalmongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // req.user is the currently logged in user
    // this will pass req.user to all of the routes (currentUser will be accessible anywhere)
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.primary = req.flash("primary");

    next();
});

console.log(process.env.DATABASEURL);

mongoose.connect(process.env.DATABASEURL , {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log("connected to db");
}).catch( err => {
    console.log(err);
});

/*
let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

*/
//"mongodb+srv://dimo:Iy6ZtnPiNmwrIjQX@cluster0.vewcs.mongodb.net/augmentx?retryWrites=true&w=majority"
//mongoose.connect("mongodb://localhost:27017/augmentx");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
// express sanitizer must be after body parser
app.use(expressSanitizer());
//app.use(enforce.HTTPS({ trustProtoHeader: true }));


// use route files
app.use(commentRoutes);
app.use(postRoutes);
app.use(mainRoutes);
app.use(userRoutes);


app.get('*', (req, res) => {
    res.send('Wrong route');
});

//http.createServer
(app).listen(process.env.PORT || 3000, function() {
    console.log('app started on port 3000');
});
