var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/cinefile_app');

mongoose.set('debug', true);

module.exports.Movie = require('./movie.js');
module.exports.User = require('./user');