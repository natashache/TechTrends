angular.module('app.controllers', [
  'app.services'
])
.controller('navController', function($scope,navService) {
    $scope.country = navService.rootLocations;
  // $scope.states = $scope.country.states;
  // $scope.selectedState = $scope.states[0]
  // $scope.populateDrop = function() {
  //   $scope.currentCities = Object.keys($scope.country[$scope.selectedState]);
  // }
})
.controller('chartController', ['$scope', 'queryService', 'chartService',function($scope, queryService, chartService) {
  $scope.chartOptions = {};

  fill();
  var hubData = null;

  $scope.hub = 'San Francisco';

  //methods used by external buttons/menus
  $scope.fill = fill; 
  $scope.view = 'serverLanguages';
  
  //query and change the options
  function fill(){
    var qs = '/analyzed-data?hub=san_francisco';
    queryService.getDataFromServer(qs,function(data){
      var chartData = chartService.formatResponseData(data);
      //these sets trigger watch on the chart directive
      
      $scope.chartOptions.series = chartData[$scope.view].data;
      $scope.chartOptions.dates = chartData[$scope.view].dates;
      $scope.chartOptions.view = $scope.view; 
      $scope.chartOptions.hub = $scope.hub; 
    });
  }
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

