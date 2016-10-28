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
.controller('chartController', ['$scope', 'queryService', 'chartService', function($scope, queryService, chartService) {
  
  init();
  $scope.view = 'javascriptFrameworks';

  function init(){
    var qs = '/analyzed-data?hub=San%20Francisco';
    queryService.getDataFromServer(qs,function(data){
      var chartData = chartService.formatResponseData(data);
      setOptions(chartData);
    });
  }

  function setOptions(data){
      $scope.chartOptions = {
      title: {
        text: `JS Framework Popularity for xxx` //template string add in hub location
      },
      xAxis: {
        type: 'datetime',
        catagories: data[$scope.view].dates
      },
      series: data[$scope.view].data
    }
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
      Highcharts.chart(element[0], scope.options);
    }
  };
})

