angular.module('mainApp', [

]).controller('stateCtrl', ['$scope', function($scope) {
  $scope.data = {
    default: 'Select State:',
    states: Object.keys(keys.collections.geo.united_states)
  }

}])


