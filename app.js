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
  secret: SESSION_SECRET,
  name: 'session use name'
}));

app.use(loginMiddleware);

//ROUTE

app.get('/', routeMiddleware.ensureLoggedIn, function(req,res){
  res.redirect('/movies');
});