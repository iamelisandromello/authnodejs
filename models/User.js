const mongoose                = require('mongoose');
mongoose.Promise              = global.Promise;

const passportLocalMongoose   = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
   name                 : String,
   lastname             : String,
   username             : String,
   email                : String,
   resetPasswordToken   : String,
   resetPasswordExpires : Date,
   roles       : [{
      type:     String,
      required : true,
      enum     : ['user', 'admin'],
      default  : 'user'

   }]
}, {versionKey: false});

userSchema.methods.validPassword = function (password) {
   if (password === this.password) {
     return true; 
   } else {
     return false;
   }
 }

userSchema.plugin(passportLocalMongoose, { usernameField : 'email' });

module.exports = mongoose.model('User', userSchema);

