app.service('UserService',['$http','$window', function($http,$window){
  return {
    signup: function(user) {
      return $http.post('/api/users/signup', user);
    },
    login: function(user) {
      console.log('this is user', user);
      return $http.post('/api/users/login', user);
    },
    setCurrentUser: function(data) {
      $window.localStorage.setItem('user', JSON.stringify(data.data.user));
    },
    getCurrentUser: function() {
      return JSON.parse($window.localStorage.getItem('user'));
    }
  };
}]);