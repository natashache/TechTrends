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
.factory('navService', function() {
  //var country = keys.collections.geo.united_states;
  // country.states = Object.keys(keys.collections.geo.united_states);
  // country.states.unshift('Select State:');
  return {
    rootLocations: ['San Francisco', 'Kansas City']
  }
})
.factory('chartService',function(){
  
  function createCatagories(hubDataPoints){
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

  function extractDates(hubData){
    return hubData.map((data) => {
      return moment.unix(data[0].date).format('MMMM DD'); //change format later
    });
  }

  function extractDataPoints(hubData){
    return hubData.map((data) => {
      return data.data;
    });
  }

  function highChartsFormat(data){
    let result = {};

    result.dates = extractDates(data);
    result.data = createCatagories(extractDataPoints(data));

    return result; 
  }

  function formatResponseData(data){
    var obj = {};
    for(let key in data) {
        obj[key] = highChartsFormat(data[key]);
      }
    return obj;
  }

  return {
    formatResponseData: formatResponseData,
    highChartsFormat: highChartsFormat,
    // extractDataPoints: extractDataPoints,
    // createCatagories: createCatagories,
    // extractDates: extractDates,
  };

})
