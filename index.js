let express = require('express');
let app = express();
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home");
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
