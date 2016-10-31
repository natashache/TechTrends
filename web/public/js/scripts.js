
(function(){
    
    var Typey = function(){

        this.types = { };

        this.schema = function(name,newschema){
            this.types[name] = newschema;
        }

        this.number = function(target){
            return typeof target === 'number';
        }

        this.array = function(schema){
            return this._array.bind(this,schema);
        }

        this.object = function(schema){
            return this._object.bind(this,schema);
        }

        this.Array = function(target){
            return Array.isArray(target);
        }

        this.Object = function(target){
            return (!Array.isArray(target) && typeof target === 'object');
        }

        this.String = function(target){
            return typeof target === 'string';
        }

        this.Number = function(target){
            return typeof target === 'number';
        }

        this._object = function(schema,input){
            if(!this.Object(input)){
                return false;
            }
            return this.objectParse(schema,input);
        }

        this._array = function(schema,input){
            if(!this.Array(input)){
                return false;
            }
            return this.objectParse(schema,input);
        }

        this.objectParse = function(schema,input){
            var schemaKeys = Object.keys(schema);

            return schemaKeys.every(function(schemaKey,index){
              var inputValue = input[schemaKey];

              if(schemaKey === '*'){
                  return Object.keys(input).some(function(inputKey){
                      return schema[schemaKey].call(this,input[inputKey]); 
                  });
              }
              else if(!inputValue){
                  return false;
              } else {
                  if(typeof schema[schemaKey] === 'function'){
                      return schema[schemaKey].call(this,inputValue); 
                  } else {
                      return schema[schemaKey] === inputValue;
                  }
                  
              }
            });
        }

        this.deepMatch = function(type, target){
            //return (check.all(check.map(target,this.types[type]))) === true;
        }

        this.match = function(input, schema){
            return this.types[schema].call(this,input); 
        }
    }

    T = new Typey();

})()

// T.schema('array',
//     T.array({
//             2: T.number,
//     })
// );

// T.schema('nestedArray',
//     T.array({
//             '*': T.array({
//                 0: 42,
//                 1: 43
//             }),
//             1: T.object({
//                 name: 'icecream',
//                 description: T.object({
//                     awesome: true,
//                 })
//             })
//     })
// );

T.schema('chartOptions',
    T.object({
        series: T.Array,
        dates: T.Array,
        view: T.String,
        hub: T.String,
    })
);

//var test = {series: [],dates: [],view:'x', hub:'x'};
//console.log(T.match(test,'chartOptions'));
//console.log(T.match(test,'nestedArray'));

angular.module('app.services', [

])
.factory('queryService',function($http, chartService){

  return {
    getDataFromServer: getDataFromServer
  };

  function getDataFromServer(endpoint, callback){
    function success(response){
      callback(response.data);
    }

    function error(err){
      console.log("error geting from database ==>", error);
    }

    $http.get(endpoint)
      .then(success, error)
  }



})
.factory('navService', function($http) {

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

    function success(response){
      callback(response.data.sort());
    }

    function error(err){
      console.log("error fetching hubs ==>", err)
    }

     $http.get('/analyzed-data/hubs')
      .then(success, error);
  }

  function getViewsFromServer(callback){
    function success(response){
      callback(response.data);
    }
    function error(err){
      console.log("error getting view list from database ==>", err);
    }

    $http.get("/analyzed-data/views")
      .then(success, error);
  }

  function formatViewsForDisplay(viewList){
    return viewList.map((viewString) => {
      return formatSingleView(viewString);
    });
  }

  function formatSingleView(viewString){
    return viewString.split(/(?=[A-Z])/)
      .map((word) => {
        if(word === "And" || word === "and" || word === "The" || word === "the"){
          let lowerCase = word.charAt(0).toLowerCase() + word.slice(1);
          return lowerCase;
        }
         let upperCase = word.charAt(0).toUpperCase() + word.slice(1);
          return upperCase;
      }).join(" ");
  }

  function formatHubsForDisplay(hubsList){
    return hubsList.map((hubString) => {
      if(hubString.includes("_")){
       let formated = hubString.split("_")
          .map((word) =>{
            let upperCase = word.charAt(0).toUpperCase() + word.slice(1);
            return upperCase;
          }).join(" ");
        return formated;
      } else {
          let formated = hubString.charAt(0).toUpperCase() + hubString.slice(1);
          return formated;
      }
    });
  }

  function formatHubForQuery(hubString){
    if(hubString.includes(" ")){
      return hubString.split(" ")
        .map((word) => {
          let lowerCase = word.charAt(0).toLowerCase() + word.slice(1);
          return lowerCase;
        }).join("_");
    } else {
      let lowerCase = hubString.charAt(0).toLowerCase() + hubString.slice(1);
      return lowerCase;
    }
  }

})
.factory('chartService',function(){

  function createCategories(hubDataPoints){
    //each databpoint is a list of techs and numbers
    let keys = Object.keys(hubDataPoints[0]);
    let result = [];

    keys.forEach( (category) => {
      let categoryObject = {
        name: category,
        data: []
      };
      hubDataPoints.forEach( (dataPoint) => {
        categoryObject.data.push(dataPoint[category]);
      });
      result.push(categoryObject);
    });
    return result;
  }

  function extractDates(dateList){
    return dateList.map((data) => {
      return moment(data.date, "x").format('MMMM DD'); //change format later
    });
  }

  function extractDataPoints(dataList){
    return dataList.map((data) => {
      return data.data;
    });
  }

  function sortData(dataList){
    return dataList.sort((a, b) => {
      if(a.date > b.date){
        return 1;
      }
      if( a.date < b.date){
        return -1
      }
      return 0
    });
  }

  function highChartsFormat(data){
    let sortedData = sortData(data);
    let result = {};

    result.dates = extractDates(sortedData);
    //result for particular view

    result.data = createCategories(extractDataPoints(sortedData));

    return result;
  }
  //aray of objects with name and data
  //iterate over the views
  function formatViews(data){
    var obj = {};
    for(let key in data) { //each individual view
      //skip unfilled views
        if(data[key].length > 0){
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

})

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
    console.log("formated view list", navService.formatViewsForDisplay(viewList));
    $rootScope.formatedViews = navService.formatViewsForDisplay(viewList);
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
      $scope.chartOptions.view = navService.formatSingleView($scope.view);
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
              text: `Popular ${scope.options.view} in ${scope.options.hub}`
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

angular.module('app',['app.controllers','app.services']);

$(function() {
  var $sidebar   = $("#chart_nav"), 
    $window    = $(window),
    offset     = $sidebar.offset(),
    topPadding = 192;

  $window.scroll(() => {
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