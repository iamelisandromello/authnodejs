const express  = require('express');
//Routes
const router   = require('./routes/index');
const User     =  require('./models/User');

//Settings
const app = express();
app.use('/', router);

app.use(express.json());

module.exports = app;   