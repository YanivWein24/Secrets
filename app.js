require('dotenv').config();
// need to require this package as early as possible, then create a hidden file called ".env"
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // used to hash the passwords
const saltRounds = 15;
// the password is being "salted" by rehashing the hash password with a random number for a given number of times.
// the higher the salting rounds, the better hash and higher decryption time (exponentially higher)


const app = express();

// console.log(process.env.SECRET)   // Fetch the secret / APIKEY ...

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});


const User = mongoose.model('User', userSchema);

app.get('/', function (req, res) {
    res.render("home"); // refers to home.ejs
});

app.get('/login', function (req, res) {
    res.render("login");    // refers to login.ejs
});

app.get('/register', function (req, res) {
    res.render("register"); // refers to register.ejs
});

app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, finalHash) {
        const newUser = new User({
            email: req.body.username,
            password: finalHash
        });
        console.log(req.body.username, finalHash);
        newUser.save(function (err) {   // the password is being *encrypted* when calling this function
            if (err) {
                console.log(err);
            } else {
                res.render("secrets")
            }
        })
    });

});


app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    //? we cant unhash the password, so instead we will hash the password provided in the POST request
    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {  // if  a user is found
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result === true) {
                        res.render("secrets");
                    } else { res.send("Wrong Password!") };
                });
            } else {
                res.send("User not found, please check the provided Email Address")
            };
        };
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log("Server started on port 3000");
});