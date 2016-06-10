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
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
  $scope.message = "iostock";
});
