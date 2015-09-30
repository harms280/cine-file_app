var mongoose = require('mongoose');
var Movie = require('./movie');
var bcrypt =require('bcrypt');
var SALT_WORK_FACTOR = 10;

mongoose.set('debug', true);

var userSchema = new mongoose.Schema({
  username: {type: String, 
    lowercase: true, 
    required: true, 
    unique: true
  },
  password: {type: String, required: true},
  friends: [{
    id: { type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    username: String,
    requestAccepted: {
      type:Boolean,
      default: false
    }
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'User'
  }],
  movieCollection: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  lending: [{
    id: String,
    username: String,
    requestAccepted: Boolean,
  }],
  email: String,
  avatar: String, //upload images?
  firstName: String,
  lastName: String,
  city: String,
  state: String,
  //rentals and lent here???
});

userSchema.pre('save', function (next) {
  var user = this;
  if(!user.isModified('password')) {
    return next();
  }
  return bcrypt.genSalt(SALT_WORK_FACTOR, function(err,salt){
    if (err) {
      return next(err);
    }
    return bcrypt.hash(user.password, salt, function(err,hash){
      if(err) {
        return next(err);
      }
      user.password = hash;
      return next();
    });
  }); 
});

userSchema.statics.authenticate = function (formData, callback) {
  this.findOne({
      username: formData.username
    },
    function (err, user) {
      console.log(user);
      if (user === null){
        callback("Invalid username or password",null);
      }
      else {
        user.checkPassword(formData.password, callback);
      }

    });
};

userSchema.methods.checkPassword = function(password, callback) {
  var user = this;
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (isMatch) {
      callback(null, user);
    } else {
      callback(err, null);
    }
  });
};

userSchema.pre('remove', function(callback){
  Movie.remove({owner: this._id}).exec();
  callback();
});

var User = mongoose.model('User',userSchema);

module.exports = User;