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


