app.controller('UsersController',['$scope', function($scope) {

}]);

app.controller('LoginController',['$scope','UserService','$location', function($scope,UserService,$location) {
  $scope.user = {};
  $scope.errors;

  $scope.login = function(user) {
    console.log('This is user', user);
    UserService.login(user).then(function(data) {
      $scope.loginForm.$setPristine();
      $location.path('/movies');
    }).catch(function(data) {
      $scope.errors = data.data;
      $scope.user = {};
    });
  };
}]);

app.controller('SignupController',['$scope','UserService','$location', function($scope,UserService,$location) {
  $scope.user = {};
  $scope.errors;

  $scope.signup = function(user) {
    var city = document.getElementById('city').value;
    UserService.signup(user).then(function(data) {
      UserService.setCurrentUser(data);
      // $scope.loggedIn.status = true;
      $scope.signupForm.$setPristine();
      $location.path('/movies');
    }).catch(function(data) {
      $scope.errors = data.data;
      //$scope.user = {};
      //$scope.signupForm.$setPristine();
    });
  };

}]);