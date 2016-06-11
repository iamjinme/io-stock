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
// Define a directive for Graph Morris
iostockApp.directive('linechart', function() {
  return {
    // required to make it work as an element
    restrict: 'E',
    template: '<div></div>',
    replace: true,
    // observe and manipulate the DOM
    link: function($scope, element, attrs) {
      $scope.$watch('graph_data', function() {
        console.log('updating chart...');
        $(element).html('');
        var data = $scope[attrs.data],
            xkey = $scope[attrs.xkey],
            ykeys= $scope[attrs.ykeys],
            labels= $scope[attrs.labels];
        Morris.Line({
          element: element,
          data: data,
          xkey: xkey,
          ykeys: ykeys,
          labels: labels
        });
      });
    }
  };
});
// Define the main controller on the barsquare module
iostockApp.controller('mainController', function mainController($scope, $http) {
  var socket = io();
  $scope.codes = [];
  // Morris graph parameters
  $scope.graph_data = [
     {"period": "2011 Q3", "licensed": 3407, "close": 660},
     {"period": "2011 Q2", "licensed": 3351, "close": 629},
     {"period": "2011 Q1", "licensed": 3269, "close": 618},
     {"period": "2010 Q4", "licensed": 3246, "close": 661},
     {"period": "2009 Q4", "licensed": 3171, "close": 676},
     {"period": "2008 Q4", "licensed": 3155, "close": 681},
     {"period": "2007 Q4", "licensed": 3226, "close": 620},
     {"period": "2006 Q4", "licensed": 3245, "close": null},
     {"period": "2005 Q4", "licensed": 3289, "close": null}
  ];
  console.log($scope.graph_data);
  $scope.xkey = 'period';
  $scope.ykeys = ['close'];
  $scope.labels = ['Close'];
  // Close Toast
  $scope.closeToast = function() {
    $('div.toast').addClass('hide');
  };
  // Clear buttons
  $scope.closeChip = function(element) {
    $('#code_' + element).parent().addClass('hide');
    socket.emit('pop', { code: element });
  };
  $scope.getData = function(code) {
    if (code) {
      $http.get('/api/stock/' + code)
        .success(function(data) {
          if (data) {
            $scope.graph_data = data;
            console.log(data.length);
          }
        })
        .error(function(err) {
          console.log('Error: ' + err);
        });
    }
  }
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
    $scope.getData(data.code);
    $scope.codes.push(data);
    $scope.$apply();
  });
});
