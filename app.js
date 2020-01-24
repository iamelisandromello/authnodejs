const express = require('express');
//Routes
const router = require('./routes/index');

//Settings
const app = express();
app.use('/', router);

app.use(express.json());

module.exports = app;   