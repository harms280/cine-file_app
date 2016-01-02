var mongoose = require('mongoose');
var Rental = require('./rental');

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
  thumbnailPoster: String, //from omdb
  // imdbPage: String,
  format: {
    bluRay: String,
    dvd: String,
    vhs: String,
    other: String
  }, //Blu Ray, DVD, VHS, film, digital, other???
  watched: Boolean,
  notes: String,
  dateAdded: Date,
  userRating: Number, //out of 10 stars? or 5 with .5 increments?
  backgroundImages: Array,
  rented: {type: String, default: "false"}, //false, pending, or true
//   rentalInfo: {
//     rentalId: String, //combo of username + trimmed title + Date separated by underscores
//     renterId: {
//         type: mongoose.Schema.Types.ObjectId, //userId
//         ref: "User"
//       },
//     // requestAccepted: Boolean,
//     renterName: String, //username
//     dateRented: {
//       type: Date,
//       default: Date.now()
//     }
// },
  rentals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental'
  }]
});

movieSchema.pre("remove", function(callback){
  Rental.remove({movie: this._id});
});

var Movie = mongoose.model('Movie',movieSchema);

module.exports = Movie;