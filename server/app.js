require('dotenv').load();

var express = require('express'), 
    app = express(),
    compression = require('compression'),
    db = require('./models'),
    path = require('path'),
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

loginMiddleware = require('./middleware/loginHelper');
routeMiddleware = require('./middleware/routeHelper');

//compress static files with gzip
app.use(compression());

app.use('/css', express.static(path.join(__dirname, '../client/css')));
app.use('/js', express.static(path.join(__dirname, '../client/js')));
app.use('/templates', express.static(path.join(__dirname, '../client/js/templates')));
app.use('/libs', express.static(path.join(__dirname, '../client/libs')));
app.use('/pics', express.static(path.join(__dirname, '../client/pics')));

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