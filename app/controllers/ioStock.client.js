// Define the barsquare module
var iostockApp = angular.module('iostockApp', ['ui.router']);
// Define the configuration of app
iostockApp.config(['$stateProvider' ,'$urlRouterProvider',
  function config($stateProvider, $urlRouterProvider) {
    // Define routes
    $urlRouterProvider.otherwise("/home");
    $stateProvider.
      state('home', {
        url: '/home',
        templateUrl: '/views/home.html'
      });
  }
]);
// Define the main controller on the barsquare module
iostockApp.controller('mainController', function mainController($scope, $http) {
  var socket = io();
  $scope.codes = [];
  // Close Toast
  $scope.closeToast = function() {
    $('div.toast').addClass('hide');
  };
  // Clear buttons
  $scope.closeChip = function(element) {
    $('#code_' + element).parent().addClass('hide');
    socket.emit('pop', { code: element });
  };
  $scope.postCode = function() {
    if (this.code) {
      $http.get('/api/code/' + this.code)
        .success(function(data) {
          if (data.name) {
            socket.emit('push', { code: data.code, name: data.name.split(',')[0] });
          } else {
            $('#code_message').html(' ' + data.message);
            $('div.toast').addClass('toast-danger').removeClass('hide');
          }
        })
        .error(function(err) {
          console.log('Error: ' + err);
        });
      this.code = '';
    }
  };
  socket.on('pop', function (data) {
    var pos = $scope.codes.findIndex(function(element) {
      return (element.code === data.code);
    });
    $scope.codes.splice(pos, 1);
    $scope.$apply();
  });
  socket.on('push', function (data) {
    $scope.codes.push(data);
    $scope.$apply();
  });
});
