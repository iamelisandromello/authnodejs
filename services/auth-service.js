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

exports.decodeToken = async (token) => {
   var data = await jwt.verify(token, process.env.SALT_KEY)
   return data;
}

exports.authorize = function (req, res, next) 
{
   var token = req.headers['authorization'] || req.body.token || req.query.token || req.headers['x-access-token'];
   if(token){
      if (token.startsWith('Bearer ')) {
         // Remove Bearer from string
         token = token.slice(7, token.length);
         jwt.verify(token, process.env.SALT_KEY, function(error, decoded)
         {
            console.log('JWT Verify');
            if (error) {
               res.status(401).json({
                  message: 'JWT Invalid'
               });
            } else {
               next();
            }  
         });
      }
      else {
         res.status(401).json({  
            message: 'JWT poorly formatted'
         });
      }
   } else {
      res.status(401).json({
         message: 'JWT must be provided'
      });
   }
};