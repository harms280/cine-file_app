var express = require('express'),
    router = express.Router(),
    db = require('../models'),
    // jwt = require('jsonwebtoken'), //don't need this because it's in token library
    //auth = require('../middleware/auth'),
    // tokenLib = require('../lib/token'),
    token;

loginMiddleware = require('../middleware/loginHelper');
routeMiddleware = require('../middleware/routeHelper');

//shallow routes relative to user logged in

//RENTALS INDEX
router.get('/rentals', routeMiddleware.ensureLoggedIn, function(req,res){
  //show all of your rentals by searching movies collection and returning though being rented with your id as renter
  db.Rental.find({renter: req.session.id}, function (err, rentals){
    console.log(rentals);
    db.Rental.find({owner: req.session.id}, function (err, lends) { //a rental where you are the owner
      console.log(lends);
      res.render('rentals/index', {pageTitle: "Rentals", currentUserName: currentUserName, rentals: rentals, lends: lends});
    });
  });
});

//NEW
router.get('/rentals/new', routeMiddleware.ensureLoggedIn, function(req,res){
  //when you click rent on a friends' movie collection, verify that you wish to rent title, and make a request
});

//CREATE
router.post('/rentals', routeMiddleware.ensureLoggedIn, function(req,res){
  //makes the rental property
  //make condition that prevents user from creating multiple requests
  db.Rental.find({renter: req.session.id}).where({movie: req.body.rental.movie}).where({active: true}).exec(function (err, rental) {
    console.log(rental);
    if(rental.length !== 0) {
      res.redirect('/rentals');
    } else {
      db.Rental.create(req.body.rental, function (err, rental) {
        if(err) {
          console.log(err);
          res.redirect('/rentals');
        } else {
          db.Movie.findById(req.body.rental.movie, function (err, movie) {
            movie.rented = "pending";
            movie.save();
            res.redirect('/rentals');
          });
        }
      });
    }
  });
});

//SHOW
router.get('/rentals/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //show details of a current rental or borrowed item
});

//EDIT
router.get('/rentals/:id/edit', function(req,res){
  //show proposed rentals on owner side and decline or accept (search for own movies with rental setting as "pending", which changes the rental status to true or false,

});

//UPDATE
router.put('/rentals/:id', function(req,res){
  //if accepted rental request, then check to see if any other people are requesting a rental, remove from their borrowed array and message them they've been declined?
    //change to true and update the rental (date.now(), and change movie.rented to equal "true"; remove any other active rentals that want the same movie;
  db.Rental.findById(req.params.id).populate('movie').exec( function (err, rental) {
    if(rental.rentalAccepted === false) {
      rental.rentalAccepted = true;
      rental.dateRented = Date.now();
      rental.movie.rented = "true";
      rental.save();
      // (function callback(rental) {
      //   db.Rental.find({movie: rental.movie._id}).where({rentalAccepted: false}).remove(function (err, removed) {
      //     console.log(removed);
      //     res.redirect('/rentals');
      //   });
      // })();
      res.redirect('/rentals');
    } else {
    //for returned rentals; change active to false, movie.rented to false, set date returned to now
      // db.Rental.findById(req.params.id).populate('movie').exec(function (err, rental){
        rental.active = false;
        rental.movie.rented = "false";
        rental.dateReturned = Date.now();
        rental.save();
        res.redirect('/rentals');
      // });
    }
  });
});

//DELETE
router.delete('/rentals/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //remove a rental from the borrowed array of user and set rental status to false
  db.Rental.findByIdAndRemove(req.params.id, function (err, rental) {
    console.log("Rental object returned after deletion: ", rental);
    db.Movie.findById(rental.movie, function (err, movie) {
      if(err) {
        console.log(err);
        res.redirect('/rentals');
      } else {
        movie.rented = "false";
        movie.save();
        res.redirect('/rentals');
      }
    });
  });
});

module.exports = router;