var app = angular.module('cineFile', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider,$locationProvider,$httpProvider) {

  $routeProvider
  .when('/login', {
    templateUrl: 'templates/users/login.html',
    controller: 'UsersController',
    preventWhenLoggedIn: true
  })
  .when('/signup', {
    templateUrl: 'templates/users/signup.html',
    controller: 'SignupController',
    preventWhenLoggedIn: true,
    signup: true
  })
  .otherwise({redirectTo: 'login'});

  $locationProvider.html5Mode(true);

}]);