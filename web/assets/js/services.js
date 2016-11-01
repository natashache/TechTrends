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

  var splashObject = {

    san_francisco: "http://i.imgur.com/3wjTZYu.jpg",
    san_jose: "http://i.imgur.com/qImaJVB.jpg",
    san_diego: "http://i.imgur.com/QXMbK3j.jpg",
    boulder: "http://i.imgur.com/jpuL6qV.jpg",
    albuquerque: "http://i.imgur.com/iNZ0Jgd.jpg",
    phoenix: "http://i.imgur.com/KDjIiBd.jpg",
    boston: "http://i.imgur.com/dz05Y8N.jpg",
    dallas_fort_worth: "http://i.imgur.com/fiQHv0O.jpg",
    provo: "http://i.imgur.com/tGfRBfH.jpg",
    salt_lake_city: "http://i.imgur.com/uFC0ZiV.jpg",
    washington_dc: "http://i.imgur.com/lKRUEcG.jpg",
    raleigh: "http://i.imgur.com/epryWOU.jpg",
    portland: "http://i.imgur.com/V0Hk76j.jpg",
    pittsburg: "http://i.imgur.com/LGySmxR.jpg",
    new_york: "http://i.imgur.com/5oquvwn.jpg",
    seattle: "http://i.imgur.com/BAona8Q.jpg",
    philadelphia: "http://i.imgur.com/CnuNpeu.jpg",
    nashville: "http://i.imgur.com/6U99czT.jpg",
    memphis: "http://i.imgur.com/lj9Zdys.jpg",
    kansas_city: "http://i.imgur.com/Hl9kuf0.jpg",
    atlanta: "http://i.imgur.com/mrKRqkt.jpg",
    austin: "http://i.imgur.com/w61TJNl.jpg",
    chicago: "http://i.imgur.com/9LhUQ8x.png",
    los_angeles: "http://i.imgur.com/n28KowY.jpg",
    houston: "http://i.imgur.com/ThrZVIP.jpg"
  }

  return {
    splashObject: splashObject,
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
