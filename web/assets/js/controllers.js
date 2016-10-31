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
    var qs = '/analyzed-data?hub='+navService.formatHubForQuery($scope.hub);
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
              text: `${scope.options.view} Popularity for ${scope.options.hub}`
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
.directive('scrollSpy', function ($window) {
  return {
    restrict: 'A',
    controller: function ($scope) {
      $scope.spies = [];
      //$scope.spyElems = [];
      this.addSpy = function (spyObj) {
        $scope.spies.push(spyObj);
        if($scope.spies.length === 1){
          spyObj.in();
        }
        //$scope.spyElems[spyObj.id] = $('#' + spyObj.id);
      };
    },
    link: function (scope, elem, attrs) {
      var spyElems;
      spyElems = [];
      // getElements();
      // scope.$watch('spies', getElements);
      
      // function getElements(spies) {
      //   //the elements to the spy elements array
      //   var spy, _i, _len, _results;
      //   _results = [];

      //   for (_i = 0, _len = spies.length; _i < _len; _i++) {
      //     spy = spies[_i];

      //     if (spyElems[spy.id] == null) {
      //       _results.push(;
      //     }
      //   }
      //   return _results;
      // };

      $($window).scroll(function () {
        var OFFSETTRIGGER = 270; //higher numbers trigger an earlier change to the next element
        var DEFAULTMARGIN = 500;
        var highlightSpy, pos, spy, _i, _len, _ref;
        highlightSpy = null;
        _ref = scope.spies;
        var spyElems = scope.spyElems;
        // cycle through `spy` elements to find which to highlight
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          spy = _ref[_i];
          if($window.scrollY > DEFAULTMARGIN){
            spy.out();
          }
          
          var elem = $('#' + spy.id)
          // catch case where a `spy` does not have an associated `id` anchor
          // if (scope.spyElems[spy.id].offset() === undefined) {
          //   continue;
          // }
          if ((pos = elem.offset().top) - $window.scrollY <= OFFSETTRIGGER) {
            // the window has been scrolled past the top of a spy element
            spy.pos = pos;

            if (highlightSpy == null) {
              highlightSpy = spy;
            }
            if (highlightSpy.pos < spy.pos) {
              highlightSpy = spy;
            }
          }
        }

        // select the last `spy` if the scrollbar is at the bottom of the page
        if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
          spy.pos = pos;
          highlightSpy = spy;
        }        

        return highlightSpy != null ? highlightSpy["in"]() : void 0;
      });
    }
  };
})
.directive('spy', function ($location, $anchorScroll) {
  return {
    restrict: "A",
    require: "^scrollSpy",
    link: function(scope, elem, attrs, affix) {
      elem.click(function () {
        $location.hash(attrs.spy);
        $anchorScroll();
      });

      affix.addSpy({
        id: attrs.spy,
        in: function() {
          elem.addClass('active');
        },
        out: function() {
          elem.removeClass('active');
        }
      });
    }
  };
});
