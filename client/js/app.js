var app = angular.module('cineFile', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider,$locationProvider,$httpProvider) {

  $routeProvider
  .when('/login', {
    templateUrl: 'templates/users/login.html',
    controller: 'LoginController',
    preventWhenLoggedIn: true
  })
  .when('/signup', {
    templateUrl: 'templates/users/signup.html',
    controller: 'SignupController',
    preventWhenLoggedIn: true,
    signup: true
  })
  .when('/about', {
    templateUrl: 'templates/users/about.html'
  })

  //movie routes
  .when('/movies', {
    templateUrl: 'templates/movies/index.html',
    restricted: true,
    controller: 'MovieController'
  })

  .otherwise({redirectTo: 'login'});

  $locationProvider.html5Mode(true);

}]);