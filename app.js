require('dotenv').config();
// need to require this package as early as possible, then create a hidden file called ".env"
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

//* in this version we use "express-session" to create a cookie every time a user is registed or logged in.
//* this cookie will authenticate the user everytime its neceserry, and then the cookie will be destroyed after
//* closing the browser or logging out (when the session is over).

const app = express();

// console.log(process.env.SECRET)   // Fetch the secret / APIKEY ...

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

//! the order is very important!

app.use(session({    //? using express-session
    secret: 'A long string which is the secret key.', // just set as a long string
    resave: false, // default
    saveUninitialized: true,  // default
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function (req, res) {
    res.render("home"); // refers to home.ejs
});

app.get('/login', function (req, res) {
    res.render("login");    // refers to login.ejs
});

app.get('/register', function (req, res) {
    res.render("register"); // refers to register.ejs
});

app.get('/secrets', function (req, res) {
    //? if a user tries to get to "/secrets" without being authenticated or after deleting the cookie,
    //? they will be redirected to the login page in order to authenticate.
    if (req.isAuthenticated()) {
        res.render("secrets"); // refers to secrets.ejs
    } else {
        res.redirect("/login"); // refers to login.ejs if the request is not authenticated
    }
});

app.get("/logout", function (req, res) {
    req.logout();  // pasport.js method
    res.redirect("/");
});

app.post("/register", function (req, res) {
    User.register({ email: req.body.username, username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            });
        }
    });
});


app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {  // pasport.js method
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            });
        }
    });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log("Server started on port 3000");
});