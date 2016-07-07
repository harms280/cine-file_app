var app = angular.module('cineFile', ['ngRoute']);

app.config(function($stateProvider,$urlRouterProvider,$locationProvider) {

  $urlRouterProvider.otherwise('/login');

  $stateProvider
    .state('')

});