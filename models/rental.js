var mongoose = require('mongoose');

mongoose.set('debug', true);

var rentalSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  ownerName: String,
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  renterName: String,
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie"
  },
  movieTitle: String,
  movieYear: String,
  moviePoster: String,
  rentalAccepted: {type: Boolean, default: false},
  active: {type: Boolean, default: true},
  dateRented: {type: Date, default: Date.now()}
});

var Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental;