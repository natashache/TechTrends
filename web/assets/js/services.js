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
  //var country = keys.collections.geo.united_states;
  // country.states = Object.keys(keys.collections.geo.united_states);
  // country.states.unshift('Select State:');

  return {
    getHubsFromServer: getHubsFromServer,
    getViewsFromServer: getViewsFromServer,
    selectedHub: "san_francisco",
  };

  function getHubsFromServer(callback) {

    function success(response){
      callback(response.data);
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
    highChartsFormat: highChartsFormat,
    // extractDataPoints: extractDataPoints,
    // createCatagories: createCatagories,
    // extractDates: extractDates,
  };

})
