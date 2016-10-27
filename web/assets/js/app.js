let data = [[{"date":0,"hub":"San Francisco","viewName":"javaScriptFrameWorks","data":{"mercury":0,"vue":1,"polymer":2,"aurelia":3,"knockout":4,"ember":5,"react":6,"backbone":7,"angular":8}},{"date":86400000,"hub":"San Francisco","viewName":"javaScriptFrameWorks","data":{"mercury":1,"vue":2,"polymer":3,"aurelia":4,"knockout":5,"ember":6,"react":7,"backbone":8,"angular":9}},{"date":172800000,"hub":"San Francisco","viewName":"javaScriptFrameWorks","data":{"mercury":2,"vue":3,"polymer":4,"aurelia":5,"knockout":6,"ember":7,"react":8,"backbone":9,"angular":10}},{"date":259200000,"hub":"San Francisco","viewName":"javaScriptFrameWorks","data":{"mercury":3,"vue":4,"polymer":5,"aurelia":6,"knockout":7,"ember":8,"react":9,"backbone":10,"angular":11}},{"date":345600000,"hub":"San Francisco","viewName":"javaScriptFrameWorks","data":{"mercury":4,"vue":5,"polymer":6,"aurelia":7,"knockout":8,"ember":9,"react":10,"backbone":11,"angular":12}},{"date":432000000,"hub":"San Francisco","viewName":"javaScriptFrameWorks","data":{"mercury":5,"vue":6,"polymer":7,"aurelia":8,"knockout":9,"ember":10,"react":11,"backbone":12,"angular":13}},{"date":518400000,"hub":"San Francisco","viewName":"javaScriptFrameWorks","data":{"mercury":6,"vue":7,"polymer":8,"aurelia":9,"knockout":10,"ember":11,"react":12,"backbone":13,"angular":14}}],[{"date":0,"hub":"Kansas City","viewName":"javaScriptFrameWorks","data":{"mercury":7,"vue":8,"polymer":9,"aurelia":10,"knockout":11,"ember":12,"react":13,"backbone":14,"angular":15}},{"date":86400000,"hub":"Kansas City","viewName":"javaScriptFrameWorks","data":{"mercury":6,"vue":7,"polymer":8,"aurelia":9,"knockout":10,"ember":11,"react":12,"backbone":13,"angular":14}},{"date":172800000,"hub":"Kansas City","viewName":"javaScriptFrameWorks","data":{"mercury":5,"vue":6,"polymer":7,"aurelia":8,"knockout":9,"ember":10,"react":11,"backbone":12,"angular":13}},{"date":259200000,"hub":"Kansas City","viewName":"javaScriptFrameWorks","data":{"mercury":4,"vue":5,"polymer":6,"aurelia":7,"knockout":8,"ember":9,"react":10,"backbone":11,"angular":12}},{"date":345600000,"hub":"Kansas City","viewName":"javaScriptFrameWorks","data":{"mercury":3,"vue":4,"polymer":5,"aurelia":6,"knockout":7,"ember":8,"react":9,"backbone":10,"angular":11}},{"date":432000000,"hub":"Kansas City","viewName":"javaScriptFrameWorks","data":{"mercury":2,"vue":3,"polymer":4,"aurelia":5,"knockout":6,"ember":7,"react":8,"backbone":9,"angular":10}},{"date":518400000,"hub":"Kansas City","viewName":"javaScriptFrameWorks","data":{"mercury":1,"vue":2,"polymer":3,"aurelia":4,"knockout":5,"ember":6,"react":7,"backbone":8,"angular":9}}]];


angular.module('mainApp', [

])
.factory('country', function() {
  var country = keys.collections.geo.united_states;
  country.states = Object.keys(keys.collections.geo.united_states);
  country.states.unshift('Select State:');
  return {
    rootLocations: country
  }
})

.controller('stateCtrl', function($scope, country) {
  $scope.country = country.rootLocations;
  $scope.states = $scope.country.states;
  $scope.selectedState = $scope.states[0]
  $scope.populateDrop = function() {
    $scope.currentCities = Object.keys($scope.country[$scope.selectedState]);
  }
})

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

.controller('chartCtrl', function($scope) {
  let chartData = highChartsFormat(data[0]);
  
  $scope.chartOptions = {
    title: {
      text: `JS Framework Popularity for ${data[0][0].hub}` //template string add in hub location
    },
    xAxis: {
      type: 'datetime',
      catagories: chartData.dates //extractDates(data)
    },
    series: chartData.data //formatSeriesData(data)
  }
})




