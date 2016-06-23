var express = require('express'),
    router = express.Router(),
    db = require('../models'),
    // jwt = require('jsonwebtoken'), //don't need this because it's in token library
    //auth = require('../middleware/auth'),
    tokenLib = require('../lib/token'),
    token;


loginMiddleware = require('./middleware/loginHelper');
routeMiddleware = require('./middleware/routeHelper');

//must be logged in to see any of these. Shallow routing

//INDEX
router.get('/movies', routeMiddleware.ensureLoggedIn, function(req,res){
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
router.get('/movies/new', routeMiddleware.ensureLoggedIn, function(req,response){
  //add new movie to your collection, run a request for the movie title that user typed in, this will search the apis for the right movie by title, for you to select
  //when you select movie, it makes the proper requests to make movie object when you post it
  // var searchResults = [];
  if(req.query.movieSearch.length === 0) {
    response.redirect('/movies');
  }
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
router.post('/movies', routeMiddleware.ensureLoggedIn, function(req,res){
  //create movie in movie db
  var titleSearch = encodeURIComponent(req.body.title);
  mdb.movieInfo({id: req.body.id}, function(err, mdbRes){
    console.log("mdb result", mdbRes);
    request('http://www.omdbapi.com/?t='+ titleSearch, function (err,response,data){
      if(!err && response.statusCode === 200) {
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
            dateAdded: moment().format('LL'),
            backgroundImages: images.backdrops.splice(0,5),
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
router.get('/movies/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //show all movie details, slideshow of the background images, will only have option to edit if the correct user
  db.Movie.findById(req.params.id, function (err,movie) {
    
    var title = encodeURIComponent(movie.title);
    res.render('movies/show', {movie:movie, title: title, pageTitle: "Movie Details", currentUserName: currentUserName});
  });

});

//EDIT
router.get('/movies/:id/edit', routeMiddleware.ensureCorrectUserForMovie, function(req,res){
  //list of info of movie, shouldn't be able to edit the title (searching etc), just notes
  db.Movie.findById(req.params.id, function (err, movie) {
    res.render('movies/edit', {pageTitle: 'Edit Movie', currentUserName: currentUserName, movie: movie});
  });
});

//UPDATE
router.put('/movies/:id', function(req,res){
  //update movie details
  db.Movie.findByIdAndUpdate(req.params.id, req.body.movie, function (err, movie){
    // console.log(req.body.movie);
    res.redirect('/movies/' + req.params.id);
  });
});

//DELETE
router.delete('/movies/:id', routeMiddleware.ensureCorrectUserForMovie, function(req, res) {
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


module.exports = router;