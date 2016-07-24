app.controller('UsersController',['$scope', function($scope) {

}]);

app.controller('SignupController',['$scope','UserService','$location', function($scope,UserService,$location) {
  $scope.user = {};
  $scope.errors;

  $scope.signup = function(user) {
    UserService.signup(user).then(function(data) {
      UserService.setCurrentUser(data);
      // $scope.loggedIn.status = true;
      $scope.signupForm.$setPristine();
      $location.path('/movies');
    }).catch(function(data) {
      $scope.errors = data.data;
      $scope.user ={};
      $scope.signupForm.$setPristine();
    });
  };

}]);