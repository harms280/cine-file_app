var app = angular.module('cineFile', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider,$locationProvider,$httpProvider) {

  $routeProvider
  .when('/login', {
    templateUrl: 'templates/users/login.html',
    controller: 'UsersController',
    preventWhenLoggedIn: true
  })
  .otherwise({redirectTo: 'login'});


}]);