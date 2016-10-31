angular.module('app.controllers', [
  'app.services'
])
.controller('navController', ['$scope','$rootScope', 'navService', function($scope, $rootScope, navService) {

  $scope.hubs;

  const fillHubs = function() {
    navService.getHubsFromServer((responseData) => {
      $scope.hubs = responseData;
      $scope.hubs.unshift("Select a Tech Hub");
      $scope.selectedHub = $scope.hubs[0];
    });
  };

  const logChange = function() {
    navService.selectedHub = $scope.selectedHub;
    $rootScope.hub = $scope.selectedHub;
  };

  navService.getViewsFromServer((viewList) => {
    $rootScope.viewList = viewList;
    console.log("root view list", $rootScope.viewList);
  });

  fillHubs();
  $scope.logChange = logChange;
}])
.controller('chartController', ['$scope', '$rootScope', 'navService', 'queryService', 'chartService',function($scope, $rootScope, navService, queryService, chartService) {
  $scope.chartOptions = {};


  fill();
  var hubData = null;

  //$scope.hub = 'San Francisco';

  //methods used by external buttons/menus
  $scope.fill = fill;
  //$scope.view = 'serverLanguages';

  //query and change the options
  function fill(){
    var qs = `/analyzed-data?hub=${navService.selectedHub}`;
    queryService.getDataFromServer(qs,function(data){
      var chartData = chartService.formatResponseData(data);
      //these sets trigger watch on the chart directive

      $scope.chartOptions.series = chartData[$scope.view].data;
      $scope.chartOptions.dates = chartData[$scope.view].dates;
      $scope.chartOptions.view = $scope.view;
      $scope.chartOptions.hub = $scope.hub || "San Francisco";
    });
  }

  //watches for hub changes
  $rootScope.$watch('hub', fill, true);

}])
.directive('hcChart', function() {
  return {
    restrict: 'E',
    template: '<div></div>',
    scope: {
      options: '='
    },
    link: function(scope, element) {

      scope.$watch('options', function(newValue, oldValue) {
          if (newValue)
            if(T.match(scope.options,'chartOptions')){
              var options = getOptions(scope);
              Highcharts.chart(element[0], options);
            }
      }, true);

      function getOptions(scope){
        var obj = {
            title: {
              text: `${scope.options.view} Popularity for ${scope.options.hub}` //template string add in hub location
            },
            xAxis: {
              type: 'datetime',
              categories: scope.options.dates
            },
            series: scope.options.series
          }
        return obj;
      }
    }
  };
})

