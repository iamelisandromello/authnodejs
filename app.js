const express  = require('express');
//Routes
const router   = require('./routes/index');
const passport       = require('passport');
const LocalStrategy  = require('passport-local').Strategy;

//Settings
const app = express();

//Passport Authentication
app.use(passport.initialize());
app.use(passport.session());
const User =  require('./models/User');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', router);

app.use(express.json());

module.exports = app;   