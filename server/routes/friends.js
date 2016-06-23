var express = require('express'),
    router = express.Router(),
    db = require('../models'),
    // jwt = require('jsonwebtoken'), //don't need this because it's in token library
    //auth = require('../middleware/auth'),
    tokenLib = require('../lib/token'),
    token;

loginMiddleware = require('./middleware/loginHelper');
routeMiddleware = require('./middleware/routeHelper');

//shallow routes for user

//INDEX
router.get('/', routeMiddleware.ensureLoggedIn, function(req,res){
  //List of logged in user's friends, which will be sorted according to matching the friends accepted true of logged in user
  db.User.findById(req.session.id).populate('friends._id').exec(function (err,user){
    console.log(user);
    res.render('friends/index', {currentUserName: currentUserName, pageTitle: "Friends List", user: user});
  });
});

//NEW
//This is used when searching for a new friend
router.get('/new', routeMiddleware.ensureLoggedIn, function(req,res){
  //go here when you want to send friend request, search db for friends that aren't in current list by their ids
  if(!req.query.friendSearch) {
    res.redirect('/users');
  } else {
    var pending;
    var friended;
    // console.log(friend)
    db.User.findOne({username: req.query.friendSearch}).exec(function(err,friend) {
      if(err) res.redirect('/users');
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
router.post('/', function(req,res){
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
router.get('/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //show friend details; have a part on the page that shows if you are friends or not or pending;
  db.User.findById(req.params.id, function (err, friend) {
    res.render('friends/show', {currentUserName: currentUserName, pageTitle: "Friend Details", friend: friend});
  }); 
});

//FRIEND'S COLLECTION
router.get('/:id/collection', routeMiddleware.ensureLoggedIn, function(req,res){
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
router.get('/:id/edit', routeMiddleware.ensureLoggedIn, function(req,res){
  //this is the route where you decide to accept a friend request, which updates the accepted field in your array of friends, as well as in the other person's array
});

//UPDATE
router.put('/:id', function(req,res){
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
router.delete('/:id', routeMiddleware.ensureLoggedIn, function(req,res){
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

module.exports = router;