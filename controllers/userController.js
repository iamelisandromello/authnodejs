const mongoose       = require('mongoose');
const User           = mongoose.model('User');
const RespostaClass  = require('../classes/responseClass'); 

exports.loginAction = async(req, res) => { 
   res.send('Controller User...'); 
}