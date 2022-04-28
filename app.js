require('dotenv').config();
// need to require this package as early as possible, then create a hidden file called ".env"
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');


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
        unique: true,
    },
    password: String,
    googleID: String,
    facebookID: String

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(null, user);
    });
});

//! the order is very important!

// https://www.passportjs.org/packages/passport-google-oauth20/ 
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"    //? change this is case of deprecation
},
    function (accessToken, refreshToken, profile, cb) {
        // console.log(profile); // the user profile JSON we get from google 
        // console.log(profile.emails[0].value);
        User.findOrCreate({ googleID: profile.id, email: "g-" + profile.emails[0].value }, function (err, user) {
            //? "findOrCreate" is not a mongoose function,we need to require it.
            //? we can search for: "mongoose-findorcreate" in NPM and require this package to the project
            if (err) { console.log(err) }
            return cb(err, user);
        });
    }
));

// https://www.passportjs.org/packages/passport-facebook/
passport.use(new FacebookStrategy({
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets",
    profileFields: ['id', 'emails', 'name']
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile.emails, profile.emails[0].value);
        User.findOrCreate({ facebookID: profile.id, email: "f-" + profile.emails[0].value }, function (err, user) {
            if (err) { console.log(err) }
            return cb(err, user);
        });
    }
));

app.get('/', function (req, res) {
    res.render("home"); // refers to home.ejs
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));


// redirect from google:
app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }), // redirect to "/login" if not successful
    function (req, res) {
        // Successful authentication, redirect to "secrets".
        res.redirect('/secrets');
    });

// redirect from facebook:
app.get('/auth/facebook/secrets',
    passport.authenticate('facebook', { failureRedirect: '/login' }), // redirect to "/login" if not successful
    function (req, res) {
        // Successful authentication, redirect to "secrets".
        res.redirect('/secrets');
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
        if (User.findOne({ email: req.body.username })) {
            res.send("This Email is already registered!");
        }
        else if (err) {
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