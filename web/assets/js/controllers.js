angular.module('app.controllers', [
  'app.services'
])
.controller('navController', ['$scope','$rootScope', 'navService', function($scope, $rootScope, navService) {

  $scope.hubs;

  const fillHubs = function() {
    navService.getHubsFromServer((responseData) => {
      $scope.hubs = navService.formatHubsForDisplay(responseData);
      $scope.selectedHub = $scope.hubs[$scope.hubs.indexOf("San Francisco")];
    });
  };

  const logChange = function() {
    $rootScope.hub = $scope.selectedHub;
  };

  navService.getViewsFromServer((viewList) => {
    $rootScope.viewList = viewList;
  });

  fillHubs();
  $rootScope.hub = "San Francisco";
  $scope.logChange = logChange;
}])
.controller('chartController', ['$scope', '$rootScope', 'navService', 'queryService', 'chartService',function($scope, $rootScope, navService, queryService, chartService) {
  $scope.chartOptions = {};

  fill();
  var hubData = null;
  $scope.fill = fill;

  function fill(){
    var qs = `/analyzed-data?hub=${navService.formatHubForQuery($scope.hub)}`;
    queryService.getDataFromServer(qs,function(data){
      var chartData = chartService.formatResponseData(data);
      //these sets trigger watch on the chart directive

      $scope.chartOptions.series = chartData[$scope.view].data;
      $scope.chartOptions.dates = chartData[$scope.view].dates;
      $scope.chartOptions.view = $scope.view;
      $scope.chartOptions.hub = $scope.hub;
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

