var mongoose = require('mongoose');

mongoose.set('debug', true);

var movieSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: { type: String, required: true},
  director: String,
  year: String, //grab from omdb
  actors: String, //omdb
  plot: String, //omdb
  poster: String, //concatentate from themoviedb
  imdbPage: String,
  format: String, //Blu Ray, DVD, VHS, film, digital, other???
  watched: Boolean,
  rented: Boolean,
  notes: String,
  dateAdded: Date,
  userRating: Number, //out of 10 stars? or 5 with .5 increments?
  rentalInfo: {
    rentalId: String, //combo of username + trimmed title + Date separated by underscores
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    renterName: String, //username
    dateRented: Date
},
});

var Movie = mongoose.model('Movie',movieSchema);

module.exports = Movie;