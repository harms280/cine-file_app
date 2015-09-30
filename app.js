require('dotenv').load();

var express = require('express'), app = express();

var db = require('./models');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var methodOverride = require('method-override');
app.use(methodOverride('_method'));

loginMiddleware = require('./middleware/loginHelper');
routeMiddleware = require('./middleware/routeHelper');

var request = require('request');

var cheerio = require('cheerio');

var session = require('cookie-session');

var morgan = require('morgan');
app.use(morgan('tiny'));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(session({ 
  maxAge: 60000000,
  secret: process.env.SESSION_SECRET,
  name: 'session use name'
}));

app.use(loginMiddleware);

var currentUserName;

//ROUTE

app.get('/', routeMiddleware.ensureLoggedIn, function(req,res){
  res.redirect('/users');
});

app.get('/login', routeMiddleware.preventLoginSignup, function(req,res){
  res.render('users/login', {pageTitle: "Login Page"});
});

app.post('/login', function(req,res){
  db.User.authenticate(req.body.user, function (err, user){
    if(err) {
      console.log(err);
      res.render('users/login', {pageTitle: 'Login Page'});
    } else if(!err && user !== null){
      req.login(user);
      currentUserName = user.username;
      console.log(user.username);
      console.log(currentUserName);
      res.redirect('/users');
    }
  });
});

app.get('/signup', routeMiddleware.preventLoginSignup, function(req,res){
  //load signup page
  res.render('users/signup', {pageTitle: "Signup Page"});
});

app.post('/signup', function(req,res){
  db.User.create(req.body.user, function (err, user){
    if(err) {
      console.log(err);
      res.redirect('/signup');
    } else {
      console.log(user);
      req.login(user);
      currentUserName = user.username;
      console.log(user.username);
      console.log(currentUserName);
      res.redirect('/users');
    }
  });
});

app.get('/logout', function(req,res){
  req.logout();
  currentUserName = "";
  res.redirect('/');
});

/********* USER ROUTES *********/

//INDEX
app.get('/users', function(req,res){ //main page once logged in. Call it main????
  //shows friend acitivity, add new movie to collection, search for movie by title (in your collection or friends)
  res.render('users/users', {currentUserName: currentUserName, pageTitle: "Main Page"});
});


//SHOW
app.get('/users/:id', function(req,res){ 
  //render user info and movie collection, what they are renting
});

//EDIT
app.get('/users/:id/edit', function(req,res){
  //option for only the user of the page
  res.render('users/edit', {title: "Edit User Profile"});
});

//UPDATE
app.put('/user/:id', function(req,res){
  //update user profile info (not movies or friends)
});

//DELETE
app.delete('/users/:id', function(req,res){
  //delete user, make sure to delete the array of movies too using the special remove
});

/********* MOVIE ROUTES *********/

//must be logged in to see any of these. Shallow routing

//INDEX
app.get('/movies', routeMiddleware.ensureLoggedIn, function(req,res){
 //your movie collection add new movie to collection, search for movie by title(extra???)
});

//NEW
app.get('/movies/new', routeMiddleware.ensureLoggedIn, function(req,res){
  //add new movie to your collection, run a request for the movie title that user typed in, this will search the apis for the right movie by title, for you to select
  //when you select movie, it makes the proper requests to make movie object when you post it
});

//CREATE
app.post('/movies', routeMiddleware.ensureLoggedIn, function(req,res){
  //create movie in movie db
});

//SHOW 
app.get('/movies/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //show all movie details, slideshow of the background images, will only have option to edit if the correct user
});

//EDIT
app.get('/movies/:id/edit', routeMiddleware.ensureCorrectUserForMovie, function(req,res){
  //list of info of movie, shouldn't be able to edit the title (searching etc), just notes
});

//UPDATE
app.put('/movies/:id', function(req,res){
  //update movie details
});

//DELETE
app.delete('/movies/:id', routeMiddleware.ensureCorrectUserForMovie, function(req, res) {
  //delete movie from db
});



/********* FRIENDS ROUTES *********/

//shallow routes for user

//INDEX
app.get('/friends', routeMiddleware.ensureLoggedIn, function(req,res){
  //List of logged in user's friends, which will be sorted according to matching the friends accepted true of logged in user
});

//NEW
app.get('/friends/new', routeMiddleware.ensureLoggedIn, function(req,res){
  //go here when you want to send friend request, search db for friends that aren't in current list by their ids
});

//CREATE
app.post('/friends', function(req,res){
  //send friend request, with default false for accepted field
});

//SHOW
app.get('/friends/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //show friend details; have a part on the page that shows if you are friends or not or pending; 
});

//EDIT
app.get('/friends/:id/edit', routeMiddleware.ensureLoggedIn, function(req,res){
  //this is the route where you decide to accept a friend request, which updates the accepted field in your array of friends, as well as in the other person's array
});

//UPDATE
app.put('/friends/:id', function(req,res){
  //this is the route when you click accept friend request
});

//DELETE
app.delete('/friends/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //when you click decline friend request, it removed them from your friends array
});

/********* RENTAL ROUTES *********/

//shallow routes relative to user logged in

//INDEX
app.get('/rentals', routeMiddleware.ensureLoggedIn, function(req,res){
  //show all of your rentals by searching movies collection and returning though being rented with your id as renter
});

//NEW
app.get('/rentals/new', routeMiddleware.ensureLoggedIn, function(req,res){
  //when you click rent on a friends' movie collection, verify that you wish to rent title, and make a request
});

//CREATE
app.post('/rentals', routeMiddleware.ensureLoggedIn, function(req,res){
  //makes the rental property 
});

//SHOW
app.get('/rentals/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //show details of a current rental or borrowed item
});

//EDIT
app.get('/rentals/:id/edit', function(req,res){
  //show proposed rentals on owner side and decline or accept (search for own movies with rental setting as "pending", which changes the rental status to true or false, 

});

//UPDATE
app.put('/rentals/:id', function(req,res){
  //if accepted rental request, then check to see if any other people are requesting a rental, remove from their borrowed array and message them they've been declined?
  //
});

//DELETE
app.delete('/rentals/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //remove a rental from the borrowed array of user and set rental status to false
});

// app.get('*', function(req,res){
//   res.render('404');
// });

app.listen(3000, function(){
  console.log("Now listening on port 3000");
});