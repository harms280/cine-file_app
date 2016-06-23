var db = require("../models");

var routeHelpers = {
  ensureLoggedIn: function(req, res, next) {
    console.log(req.session.id);
    if (req.session.id !== null && req.session.id !== undefined) {
      return next();
    }
    else {
      req.logout();
     res.redirect('/login');
    }
  },

  ensureCorrectUserForMovie: function(req, res, next) {
    db.Movie.findById(req.params.id).populate('owner').exec(function(err,movie){
      console.log(movie);
      if (movie.owner.id != req.session.id) {
        res.redirect('/movies'); //maybe pass in an error to the movies/:id/edit page???
      }
      else {
       return next();
      }
    });
  },

  ensureCorrectUserForComment: function(req, res, next) {
    db.Comment.findById(req.params.id).populate('user').exec(function(err,comment){
      console.log(comment);
      if (comment.user !== undefined && comment.user.id != req.session.id) {
        res.redirect('/posts/'+ comment.post +'/comments');
      }
      else {
       return next();
      }
    });
  },

  preventLoginSignup: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      res.redirect('/movies');
    }
    else {
     return next();
    }
  }
};

module.exports = routeHelpers;