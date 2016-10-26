angular.module('mainApp', [

])
.factory('country', function() {
  var country = keys.collections.geo.united_states;
  country.states = Object.keys(keys.collections.geo.united_states);
  return {
    rootLocations: country
  }
})

.controller('stateCtrl', function($scope, country) {
  $scope.country = country.rootLocations;
  $scope.states = $scope.country.states;
  $scope.populateDrop = function() {
    console.log('Yay, the test worked!');
  }
  // $scope.data = {
  //   default: 'Select State:',
  //   states: Object.keys(keys.collections.geo.united_states)
  // }

})


