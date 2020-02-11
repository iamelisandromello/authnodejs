const express        = require('express');
const cors           = require('cors'); //permite requisiçoes entre dominios digferentes
//Routes
const router         = require('./routes/index');
const passport       = require('passport');
const LocalStrategy  = require('passport-local').Strategy;

//Settings
const app = express();
app.use(cors());

//Passport Authentication
app.use(passport.initialize());
app.use(passport.session());
const User =  require('./models/User');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/", router);

module.exports = app;   