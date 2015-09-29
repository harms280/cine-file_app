var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cinefile_app');

mongoose.set('debug', true);

module.exports.Movie = require('./movie.js');
module.exports.User = require('./user');