'use strict';

angular.module('app.services', []).factory('queryService', function ($http, chartService) {

  return {
    getDataFromServer: getDataFromServer
  };

  function getDataFromServer(endpoint, callback) {
    function success(response) {
      callback(response.data);
    }

    function error(err) {
      console.log("error geting from database ==>", error);
    }

    $http.get(endpoint).then(success, error);
  }
}).factory('navService', function ($http) {

  return {
    getHubsFromServer: getHubsFromServer,
    getViewsFromServer: getViewsFromServer,
    selectedHub: "san_francisco",
    formatHubsForDisplay: formatHubsForDisplay,
    formatHubForQuery: formatHubForQuery,
    formatViewsForDisplay: formatViewsForDisplay,
    formatSingleView: formatSingleView
  };

  function getHubsFromServer(callback) {

    function success(response) {
      callback(response.data.sort());
    }

    function error(err) {
      console.log("error fetching hubs ==>", err);
    }

    $http.get('/analyzed-data/hubs').then(success, error);
  }

  function getViewsFromServer(callback) {
    function success(response) {
      callback(response.data);
    }
    function error(err) {
      console.log("error getting view list from database ==>", err);
    }

    $http.get("/analyzed-data/views").then(success, error);
  }

  function formatViewsForDisplay(viewList) {
    return viewList.map(function (viewString) {
      return formatSingleView(viewString);
    });
  }

  function formatSingleView(viewString) {
    return viewString.split(/(?=[A-Z])/).map(function (word) {
      if (word === "And" || word === "and" || word === "The" || word === "the") {
        var lowerCase = word.charAt(0).toLowerCase() + word.slice(1);
        return lowerCase;
      }
      var upperCase = word.charAt(0).toUpperCase() + word.slice(1);
      return upperCase;
    }).join(" ");
  }

  function formatHubsForDisplay(hubsList) {
    return hubsList.map(function (hubString) {
      if (hubString.includes("_")) {
        var formated = hubString.split("_").map(function (word) {
          var upperCase = word.charAt(0).toUpperCase() + word.slice(1);
          return upperCase;
        }).join(" ");
        return formated;
      } else {
        var _formated = hubString.charAt(0).toUpperCase() + hubString.slice(1);
        return _formated;
      }
    });
  }

  function formatHubForQuery(hubString) {
    if (hubString.includes(" ")) {
      return hubString.split(" ").map(function (word) {
        var lowerCase = word.charAt(0).toLowerCase() + word.slice(1);
        return lowerCase;
      }).join("_");
    } else {
      var lowerCase = hubString.charAt(0).toLowerCase() + hubString.slice(1);
      return lowerCase;
    }
  }
}).factory('chartService', function () {

  function createCategories(hubDataPoints) {
    //each databpoint is a list of techs and numbers
    var keys = Object.keys(hubDataPoints[0]);
    var result = [];

    keys.forEach(function (category) {
      var categoryObject = {
        name: category,
        data: []
      };
      hubDataPoints.forEach(function (dataPoint) {
        categoryObject.data.push(dataPoint[category]);
      });
      result.push(categoryObject);
    });
    return result;
  }

  function extractDates(dateList) {
    return dateList.map(function (data) {
      return moment(data.date, "x").format('MMMM DD'); //change format later
    });
  }

  function extractDataPoints(dataList) {
    return dataList.map(function (data) {
      return data.data;
    });
  }

  function sortData(dataList) {
    return dataList.sort(function (a, b) {
      if (a.date > b.date) {
        return 1;
      }
      if (a.date < b.date) {
        return -1;
      }
      return 0;
    });
  }

  function highChartsFormat(data) {
    var sortedData = sortData(data);
    var result = {};

    result.dates = extractDates(sortedData);
    //result for particular view

    result.data = createCategories(extractDataPoints(sortedData));

    return result;
  }
  //aray of objects with name and data
  //iterate over the views
  function formatViews(data) {
    var obj = {};
    for (var key in data) {
      //each individual view
      //skip unfilled views
      if (data[key].length > 0) {
        obj[key] = highChartsFormat(data[key]);
      }
    }
    return obj;
  }

  return {
    formatResponseData: formatViews,
    highChartsFormat: highChartsFormat
    // extractDataPoints: extractDataPoints,
    // createCatagories: createCatagories,
    // extractDates: extractDates,
  };
});
'use strict';

angular.module('app.controllers', ['app.services']).controller('navController', ['$scope', '$rootScope', 'navService', function ($scope, $rootScope, navService) {

  $scope.hubs;

  var fillHubs = function fillHubs() {
    navService.getHubsFromServer(function (responseData) {
      $scope.hubs = navService.formatHubsForDisplay(responseData);
      $scope.selectedHub = $scope.hubs[$scope.hubs.indexOf("San Francisco")];
    });
  };

  var logChange = function logChange() {
    $rootScope.hub = $scope.selectedHub;
  };

  navService.getViewsFromServer(function (viewList) {
    console.log("formated view list", navService.formatViewsForDisplay(viewList));
    $rootScope.formatedViews = navService.formatViewsForDisplay(viewList);
    $rootScope.viewList = viewList;
  });

  fillHubs();
  $rootScope.hub = "San Francisco";
  $scope.logChange = logChange;
}]).controller('chartController', ['$scope', '$rootScope', 'navService', 'queryService', 'chartService', function ($scope, $rootScope, navService, queryService, chartService) {
  $scope.chartOptions = {};

  fill();
  var hubData = null;
  $scope.fill = fill;

  function fill() {
    var qs = '/analyzed-data?hub=' + navService.formatHubForQuery($scope.hub);
    queryService.getDataFromServer(qs, function (data) {
      var chartData = chartService.formatResponseData(data);
      //these sets trigger watch on the chart directive

      $scope.chartOptions.series = chartData[$scope.view].data;
      $scope.chartOptions.dates = chartData[$scope.view].dates;
      $scope.chartOptions.view = navService.formatSingleView($scope.view);
      $scope.chartOptions.hub = $scope.hub;
    });
  }

  //watches for hub changes
  $rootScope.$watch('hub', fill, true);
}]).directive('hcChart', function () {
  return {
    restrict: 'E',
    template: '<div></div>',
    scope: {
      options: '='
    },
    link: function link(scope, element) {

      scope.$watch('options', function (newValue, oldValue) {
        if (newValue) if (T.match(scope.options, 'chartOptions')) {
          var options = getOptions(scope);
          Highcharts.chart(element[0], options);
        }
      }, true);

      function getOptions(scope) {
        var obj = {
          title: {
            text: 'Popular ' + scope.options.view + ' in ' + scope.options.hub
          },
          xAxis: {
            type: 'datetime',
            categories: scope.options.dates
          },
          series: scope.options.series
        };
        return obj;
      }
    }
  };
}).directive('scrollSpy', function ($window) {
  return {
    restrict: 'A',
    controller: function controller($scope) {
      $scope.spies = [];
      //$scope.spyElems = [];
      this.addSpy = function (spyObj) {
        $scope.spies.push(spyObj);
        if ($scope.spies.length === 1) {
          spyObj.in();
        }
        //$scope.spyElems[spyObj.id] = $('#' + spyObj.id);
      };
    },
    link: function link(scope, elem, attrs) {
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
          if ($window.scrollY > DEFAULTMARGIN) {
            spy.out();
          }

          var elem = $('#' + spy.id);
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
}).directive('spy', function ($location, $anchorScroll) {
  return {
    restrict: "A",
    require: "^scrollSpy",
    link: function link(scope, elem, attrs, affix) {
      elem.click(function () {
        $location.hash(attrs.spy);
        $anchorScroll();
      });

      affix.addSpy({
        id: attrs.spy,
        in: function _in() {
          elem.addClass('active');
        },
        out: function out() {
          elem.removeClass('active');
        }
      });
    }
  };
});
'use strict';

angular.module('app', ['app.controllers', 'app.services']);

$(function () {
    var $sidebar = $("#chart_nav"),
        $window = $(window),
        offset = $sidebar.offset(),
        topPadding = 192;

    $window.scroll(function () {
        if ($window.scrollTop() > offset.top) {
            $sidebar.stop().animate({
                marginTop: $window.scrollTop() - offset.top + topPadding
            });
        } else {
            $sidebar.stop().animate({
                marginTop: 84
            });
        }
    });
});