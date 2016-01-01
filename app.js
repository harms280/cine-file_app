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

var cheerio = require('cheerio');

var request = require('request');

var mdb = require('moviedb')('af10843e745e3689a2bdd1907d1de30f'); //add env for api number

var morgan = require('morgan');
app.use(morgan('tiny'));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(session({ 
  maxAge: 1200000,
  secret: process.env.SESSION_SECRET,
  name: 'session use name'
}));

app.use(loginMiddleware);

var currentUserName;

//ROUTE

app.get('/', routeMiddleware.ensureLoggedIn, function(req,res){
  res.redirect('/users');
});

app.get('/about', function(req,res){
  res.render('users/about', {pageTitle: "About Page", currentUserName: currentUserName});
});

app.get('/login', routeMiddleware.preventLoginSignup, function(req,res){
  res.render('users/login', {pageTitle: "Login Page", loginPage: true});
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
  res.redirect('/login');
});

/********* USER ROUTES *********/

//INDEX
app.get('/users', routeMiddleware.ensureLoggedIn, function(req,res){ //main page once logged in. Call it main????
  //shows friend acitivity, add new movie to collection, search for movie by title (in your collection or friends)
  res.render('users/users', {currentUserName: currentUserName, pageTitle: "Main Page"});
});


//SHOW
app.get('/users/:id', routeMiddleware.ensureLoggedIn, function(req,res){ 
  //render user info and movie collection, what they are renting
  db.User.findById(req.session.id, function (err, profile){
    res.render('users/profile', {profile: profile, pageTitle: "Profile Page", currentUserName: currentUserName});
  });
});

//EDIT
app.get('/users/:id/edit', routeMiddleware.ensureLoggedIn, function(req,res){
  //option for only the user of the page
  db.User.findById(req.session.id, function (err, profile) {
    res.render('users/edit', {pageTitle: "Edit User Profile", profile: profile, currentUserName: currentUserName});
  });
});

//UPDATE
app.put('/users/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //update user profile info (not movies or friends)
  db.User.findByIdAndUpdate(req.params.id, req.body.user, function (err, user) {
    console.log(user);
    res.redirect('/users/:id');
  });
});

//DELETE
app.delete('/users/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //delete user, make sure to delete the array of movies too using the special remove
});

/********* MOVIE ROUTES *********/

//must be logged in to see any of these. Shallow routing

//INDEX
app.get('/movies', routeMiddleware.ensureLoggedIn, function(req,res){
 //your movie collection add new movie to collection, search for movie by title(extra???)
 db.Movie.find({owner: req.session.id}, function (err, movies) {
  movies.sort(function(a,b){
    if(a.title > b.title) {
      return 1;
    }
    if(a.title < b.title) {
      return -1;
    }
    return 0;
  });
  res.render('movies/index', {currentUserName: currentUserName, pageTitle: "Personal Movie Collection", movies: movies});
 });
});

//NEW
app.get('/movies/new', routeMiddleware.ensureLoggedIn, function(req,response){
  //add new movie to your collection, run a request for the movie title that user typed in, this will search the apis for the right movie by title, for you to select
  //when you select movie, it makes the proper requests to make movie object when you post it
  // var searchResults = [];
  var titleSearch = encodeURIComponent(req.query.movieSearch);
  mdb.searchMovie({query: titleSearch}, function(err, res){
    var searchResults =  res.results.filter(function(el,i) {
      if(i<5) {
        return el;
      }
    });
    console.log(searchResults);
    response.render('movies/new', {movies: searchResults, pageTitle: "Movie Search", currentUserName: currentUserName});
  });
});

//CREATE
app.post('/movies', routeMiddleware.ensureLoggedIn, function(req,res){
  //create movie in movie db
  var titleSearch = encodeURIComponent(req.body.title);
  mdb.movieInfo({id: req.body.id}, function(err, mdbRes){
    console.log("mdb result", mdbRes);
    request('http://www.omdbapi.com/?t='+ titleSearch, function (err,response,data){
      if(!err && response.statusCode == 200) {
        var omdbMovie = JSON.parse(data);
        // console.log(omdbMovie);
        request('https://api.themoviedb.org/3/movie/'+ req.body.id +'/images?api_key='+ process.env.API_KEY +'&language=en&include_image_language=en,null', function (err, response, result){
          var images = JSON.parse(result);
          console.log("These are the images", images.backdrops);
          db.Movie.create({
            owner: req.session.id,
            title: mdbRes.title,
            director: omdbMovie.Director,
            year: omdbMovie.Year,
            actors: omdbMovie.Actors,
            plot: omdbMovie.Plot,
            poster: "https://image.tmdb.org/t/p/original"+mdbRes.poster_path,
            thumbnailPoster: omdbMovie.Poster,
            dateAdded: Date.now(),
            backgroundImages: images.backdrops,
          }, function (err, movie) {
            if(err) {
              console.log(err);
              res.redirect('/movies');
            } else {
              res.redirect('/movies');
            }
          });          
        });
      }
    });
  });
});

//SHOW 
app.get('/movies/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //show all movie details, slideshow of the background images, will only have option to edit if the correct user
  db.Movie.findById(req.params.id, function (err,movie) {
    var title = encodeURIComponent(movie.title);
    res.render('movies/show', {movie:movie, title: title, pageTitle: "Movie Details", currentUserName: currentUserName});
  });

});

//EDIT
app.get('/movies/:id/edit', routeMiddleware.ensureCorrectUserForMovie, function(req,res){
  //list of info of movie, shouldn't be able to edit the title (searching etc), just notes
  db.Movie.findById(req.params.id, function (err, movie) {
    res.render('movies/edit', {pageTitle: 'Edit Movie', currentUserName: currentUserName, movie: movie});
  });
});

//UPDATE
app.put('/movies/:id', function(req,res){
  //update movie details
  db.Movie.findByIdAndUpdate(req.params.id, req.body.movie, function (err, movie){
    // console.log(req.body.movie);
    res.redirect('/movies');
  });
});

//DELETE
app.delete('/movies/:id', routeMiddleware.ensureCorrectUserForMovie, function(req, res) {
  //delete movie from db
  db.Movie.findByIdAndRemove(req.params.id, function (err,movie) {
    if(err) {
      console.log(err);
      res.redirect('/movies');
    } else {
      res.redirect('/movies');
    }
  });
});



/********* FRIENDS ROUTES *********/

//shallow routes for user

//INDEX
app.get('/friends', routeMiddleware.ensureLoggedIn, function(req,res){
  //List of logged in user's friends, which will be sorted according to matching the friends accepted true of logged in user
  db.User.findById(req.session.id).populate('friends.id').exec(function (err,user){
    console.log(user);
    res.render('friends/index', {currentUserName: currentUserName, pageTitle: "Friends List", user: user});
  });
});

//NEW
app.get('/friends/new', routeMiddleware.ensureLoggedIn, function(req,res){
  //go here when you want to send friend request, search db for friends that aren't in current list by their ids
  if(!req.query.friendSearch) {
    res.redirect('/users');
  } else {
    var pending;
    var friended;
    // console.log(friend)
    db.User.findOne({username: req.query.friendSearch}).exec(function(err,friend) {
      db.User.findById(req.session.id, function (err, user) {
        // console.log("This is current user", user);
        // console.log("This is friend",friend);
        // console.log("Friend username",friend.username);
        user.friends.forEach(function (el) {
          // console.log("Friends inside current user: ",el);
          // console.log(el._id);
          // console.log(friend._id);
          if(el.username == req.query.friendSearch) {
            if(el.requestAccepted) {
              friended = true;
            } else {
              pending = true;
            }
          }
        });
        res.render('friends/new', {currentUserName: currentUserName, pageTitle: "Friend Search", friend: friend, pending: pending, friended: friended});
      });
      // if(err) {
      //   console.log(err);
      //   res.redirect('/users');
      // } else {
      // }
    });
  }
});

//CREATE
app.post('/friends', function(req,res){
  //send friend request, with default false for accepted field
  db.User.findById(req.session.id, function (err, user){
    user.friends.push(req.body.friend);
    // console.log(user);
    
    db.User.findById(req.body.friend._id, function (err, friend) {
      // console.log(friend);
      var friendRequested = {
        _id: req.session.id,
        username: user.username,
        receiver: true
      };
      // req.body.friend._id = req.session.id;
      // req.body.friend.username = user.username;
      // req.body.friend.receiver = true;
      // console.log(req.body.friend);
      friend.friends.push(friendRequested);
      user.save();
      friend.save();
      res.redirect('/friends');
    });

  });
});

//SHOW
app.get('/friends/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //show friend details; have a part on the page that shows if you are friends or not or pending;
  db.User.findById(req.params.id, function (err, friend) {
    res.render('friends/show', {currentUserName: currentUserName, pageTitle: "Friend Details", friend: friend});
  }); 
});

//FRIEND'S COLLECTION
app.get('/friends/:id/collection', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Movie.find({owner: req.params.id}, function (err, movies) {
    movies.sort(function(a,b){
    if(a.title > b.title) {
      return 1;
    }
    if(a.title < b.title) {
      return -1;
    }
    return 0;
  });
    db.User.findById(req.params.id, function (err, friend) {
      res.render('friends/collection', {currentUserName: currentUserName, pageTitle: "Friend's Movie Collection", movies: movies, friend: friend});
    });
  });
});

//EDIT
app.get('/friends/:id/edit', routeMiddleware.ensureLoggedIn, function(req,res){
  //this is the route where you decide to accept a friend request, which updates the accepted field in your array of friends, as well as in the other person's array
});

//UPDATE
app.put('/friends/:id', function(req,res){
  //this is the route when you click accept friend request
  db.User.findById(req.params.id, function (err, friend) {
    friend.friends.forEach(function (el) {
      console.log("From params",req.params.id);
      console.log('To string of id: ', el._id.toString());
      if(el._id.toString() == req.session.id) {
        el.requestAccepted = true;
    }
  });

    db.User.findById(req.session.id, function (err, user) {
      user.friends.forEach(function (el2) {
        console.log("From params",req.params.id);
        console.log('To string of id: ', el2._id.toString());
        if(el2._id.toString() == req.params.id) {
          el2.requestAccepted = true;
      }
    });
      friend.save();
      user.save();
      res.redirect('/friends');
  });
  });
});

//DELETE
app.delete('/friends/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //when you click decline friend request, it removed them from your friends array
  db.User.findById(req.params.id, function (err, friend) { //gets user the friend requested you
    friend.friends.forEach(function (el, i) {
      console.log("From params",req.params.id);
      console.log('To string of id: ', el._id.toString());
      if(el._id.toString() == req.session.id) {
        friend.friends.splice(i,1);
    }
  });

    db.User.findById(req.session.id, function (err, user) {
      user.friends.forEach(function (el2,i2) {
        console.log("From params",req.params.id);
        console.log('To string of id: ', el2._id.toString());
        if(el2._id.toString() == req.params.id) {
          user.friends.splice(i2,1);
      }
    });
      friend.save();
      user.save();
      res.redirect('/friends');
    });
  });
});

/********* RENTAL ROUTES *********/

//shallow routes relative to user logged in

//RENTALS INDEX
app.get('/rentals', routeMiddleware.ensureLoggedIn, function(req,res){
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
app.get('/rentals/new', routeMiddleware.ensureLoggedIn, function(req,res){
  //when you click rent on a friends' movie collection, verify that you wish to rent title, and make a request
});

//CREATE
app.post('/rentals', routeMiddleware.ensureLoggedIn, function(req,res){
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
      db.Rental.findById(req.params.id).populate('movie').exec(function (err, rental){
        rental.active = false;
        rental.movie.rented = "false";
        rental.dateReturned = Date.now();
        rental.save();
        res.redirect('/rentals');
      });
    }
  });
});

//DELETE
app.delete('/rentals/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //remove a rental from the borrowed array of user and set rental status to false
  db.Rental.findByIdAndRemove(req.params.id, function (err, movie) {
    db.Movie.findById(movie.movie, function (err, movie) {
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

app.get('*', function(req,res){
  res.render('404');
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Now listening on port 3000");
});