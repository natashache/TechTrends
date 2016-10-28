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
  
  function init(){
    var qs = `/analyzed-data?hub=San%20Francisco&viewName=javascriptFrameworks'`;
    queryService.getDataFromServer(qs,function(data){
      var chartData = chartService.formatResponseData(data);
      setOptions(response);
    });
  }

  function setOptions(data){
      $scope.chartOptions = {
      title: {
        text: `JS Framework Popularity for ${data[0][0].hub}` //template string add in hub location
      },
      xAxis: {
        type: 'datetime',
        catagories: extractDates(data)
      },
      series: formatSeriesData(data)
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

