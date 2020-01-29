const mongoose                = require('mongoose');
mongoose.Promise              = global.Promise;

const passportLocalMongoose   = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
   name        : String,
   lastname    : String,
   username    : String,
   email       : String,
   roles       : [{
      type:     String,
      required : true,
      enum     : ['user', 'admin'],
      default  : 'user'

   }]
}, {versionKey: false});

userSchema.plugin(passportLocalMongoose, { usernameField : 'email' });

module.exports = mongoose.model('User', userSchema);

