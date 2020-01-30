'use strict';

const jwt = require('jsonwebtoken');
require('dotenv').config({
   path:'variables.env'
});

exports.generateToken = async (data) => {   
   return jwt.sign(
      data,
      process.env.SALT_KEY,
      { expiresIn: '1d' }
   )
}