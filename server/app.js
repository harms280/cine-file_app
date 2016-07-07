require('dotenv').load();

var express = require('express'), 
    app = express(),
    db = require('./models'),
    bodyParser = require("body-parser"),
    methodOverride = require('method-override'),
    request = require('request'),
    session = require('cookie-session'),
    // cheerio = require('cheerio'), // find way to scrap websites better, maybe with headless browser?
    moment = require('moment'),
    mdb = require('moviedb')(process.env.API_KEY),
    morgan = require('morgan'),
    userRoutes = require('./routes/users'),
    movieRoutes = require('./routes/movies'),
    friendRoutes = require('./routes/friends'),
    rentalRoutes = require('./routes/rentals');
    
app.use(morgan('tiny'));

app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({extended: true}));

loginMiddleware = require('./middleware/loginHelper');
routeMiddleware = require('./middleware/routeHelper');

app.use(express.static(__dirname + '/client'));

app.use(session({ 
  maxAge: 1200000,
  secret: process.env.SESSION_SECRET,
  name: 'session use name'
}));

app.use(loginMiddleware);

var currentUserName;

app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/rentals', rentalRoutes);

//ROUTES

app.get('/', routeMiddleware.ensureLoggedIn, function(req,res){ //check the angular routes
  res.redirect('/movies');
});

app.get('/about', function(req,res){
  res.render('users/about', {pageTitle: "About Page", currentUserName: currentUserName});
});



app.get('*', function(req,res){
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
  });

// app.get('*', function(req,res){
//   res.render('404');
// });

app.listen(process.env.PORT || 3000, function(){
  console.log("Now listening on port 3000");
});