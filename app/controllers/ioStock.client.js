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
        //console.log(data, xkey, ykeys, labels);
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
  $scope.graph_data = [];
  $scope.xkey = 'period';
  $scope.ykeys = [];
  $scope.labels = [];
  // Close Toast
  $scope.closeToast = function() {
    $('div.toast').addClass('hide');
  };
  // Clear buttons
  $scope.closeChip = function(element) {
    $('#code_' + element).parent().addClass('hide');
    socket.emit('pop', { code: element });
  };
  // Fusion tables
  function periodExist(element) {
    return element.period === period;
  }
  $scope.push = function(old_array, new_array, code) {
    for(var i in new_array) {
      period = new_array[i].period;
      var pos = old_array.findIndex(periodExist);
      if (pos >= 0) {
        old_array[pos][code] = new_array[i].close;
      } else {
        var slot = {
          'period' : new_array[i].period
        }
        slot[code] = new_array[i].close;
        old_array.push(slot);
      }
    }
    return old_array;
  }
  // Get Stock data
  $scope.getData = function(code, name) {
    if (code) {
      $http.get('/api/stock/' + code)
        .success(function(data) {
          if (data) {
            $scope.ykeys.push(code);
            $scope.labels.push(code);
            data = JSON.stringify($scope.push($scope.graph_data, data, code));
            $scope.graph_data = JSON.parse(data);
          }
        })
        .error(function(err) {
          console.log('Error: ' + err);
        });
    }
  }
  // Post code push
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
    $scope.getData(data.code, data.name);
    $scope.codes.push(data);
    $scope.$apply();
  });
});
