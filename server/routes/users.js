var express = require('express'),
  router = express.Router(),
  db = require('../models'),
  //auth = require('../middleware/auth');
  // tokenLib = require('../lib/token'),
  // token;

loginMiddleware = require('../middleware/loginHelper');
routeMiddleware = require('../middleware/routeHelper');

router.post('/login', function(req,res){
    console.log('In Login',req.body);
  db.User.authenticate(req.body, function (err, user){
    if(err) return res.status(400).send(err);
    if(!user) return res.status(400).send({error: "Username/password invalid"});
    req.login(user); //session? replace with token?
    var listedItems = {id: user.id, username: user.username};
    res.json(listedItems);
    //res.redirect('/movies');
  });
});

router.post('/signup', function(req,res){
  console.log('This is req.body', req.body);
  db.User.create(req.body, function (err, user){
    if(err) return res.status(400).send("Username/Password can't be blank. Username must be unique");
    req.login(user); //session? replace with token?
    var listedItems = {id: user._id, username: user.username};
    res.json(listedItems);
    //res.redirect('/movies');
  });
});

router.get('/logout', function(req,res){
  req.logout();
  currentUserName = "";
  res.redirect('/login');
});

//INDEX
router.get('/users', routeMiddleware.ensureLoggedIn, function(req,res){ //main page once logged in. Call it main????
  //shows friend acitivity, add new movie to collection, search for movie by title (in your collection or friends)
  res.render('users/users', {currentUserName: currentUserName, pageTitle: "Main Page"});
});


//SHOW
router.get('/users/:id', routeMiddleware.ensureLoggedIn, function(req,res){ 
  //render user info and movie collection, what they are renting
  db.User.findById(req.session.id, function (err, profile){
    res.render('users/profile', {profile: profile, pageTitle: "Profile Page", currentUserName: currentUserName});
  });
});

//EDIT
router.get('/users/:id/edit', routeMiddleware.ensureLoggedIn, function(req,res){
  //option for only the user of the page
  db.User.findById(req.session.id, function (err, profile) {
    res.render('users/edit', {pageTitle: "Edit User Profile", profile: profile, currentUserName: currentUserName});
  });
});

//UPDATE
router.put('/users/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //update user profile info (not movies or friends)
  db.User.findByIdAndUpdate(req.params.id, req.body.user, function (err, user) {
    console.log(user);
    res.redirect('/users/:id');
  });
});

//DELETE
router.delete('/users/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  //delete user, make sure to delete the array of movies too using the special remove
});

/* This is from reddit example



router.post('/signup', function(req,res) {
  db.User.create(req.body, function(err,user){ //??does the callback have err as first argument as err because of mongo, express?
    if(err)  return res.status(400).send("Username/Password can't be blank. Username must be unique");
    var listedItems = {id: user._id, username: user.username};
    token = tokenLib.sign(user._id);
    res.json({token: token, user: listedItems});
  });
});

router.post('/login', function(req,res){
  db.User.authenticate(req.body, function(err,user){
    if (err) return res.status(400).send(err);
    if (!user) return res.status(400).send({error: "Username/password invalid"});
    var listedItems = {id: user._id, username: user.username};
    token = tokenLib.sign(user._id);
    res.json({token: token, user: listedItems}); //once successful send json with a token and the user (id and name)
  });
});

router.get('/:id', auth.checkToken, function(req,res){
  db.User.findById(req.decoded_id, function(err,user){
    if(err) res.status(500).send(err);
    if(!user) res.send(401).send(err);
    var listedItems = {id: user._id, username: user.username};
    res.status(200).send(listedItems);
  });
});

router.put('/:id', auth.checkToken, function(req,res){
  db.User.findByIdAndUpdate(req.decoded_id, req.body, {new: true}, function(err,user){
    if(err) return res.status(400).send(err);
    else {
      var listedItems = {id: user._id, username: user.username};
      res.status(200).send(listedItems);
    }
  });
});

router.delete('/:id', auth.checkToken, function(req,res){
  db.User.findByIdAndRemove(req.decoded_id, function(err,user){
    if(err) res.status(500).send(err);
    if(!user) return res.status(401).send(err);
    res.status(200).send("Removed");
  });
});

module.exports = router;

*/

module.exports = router;