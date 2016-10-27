function createCategories(hubDataPoints){
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

function extracDataPoints(hubData){
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

function getDataFromServer(hubName, callback){
  function success(response){
    let returnObj = {};

    for(let key in response.data) {
      returnObj[key] = highChartsFormat(response.data[key]);
    }

    console.log("formated object", returnObj);
    callback(returnObj);
  }

  function error(err){
    console.log("error geting from database ==>", error);
  }

  $http.get(`/analyzed-data?hub=${hubName}`)
    .then((success, error))
}

//getDataFromServer should return data in this format
// {
//   javascriptFrameworks: {
//     date: Array,
//     data: Array
//   },
//   serverLanguages: {
//     date: Array,
//     data: Array
//   },,
//   databaseLanguages: {
//     date: Array,
//     data: Array
//   },,
//   contentManagementSystems: {
//     date: Array,
//     data: Array
//   },,
//   upAndComingLanguages: {
//     date: Array,
//     data: Array
//   },,
//   javascriptMarkup: {
//     date: Array,
//     data: Array
//   },,
//   versionControlSystems: {
//     date: Array,
//     data: Array
//   },
// }

var formatSeriesData = (data) => {
  var framworkNames = Object.keys(data[0][0].data);
  var seriesFormat = [];

  framworkNames.forEach((name) => {
    var obj = {
      name: '',
      data: []
    };
    obj.name = name
    seriesFormat.push(obj)
  });

  var dataPoints = data[0].map((element) => {
    return element.data
  });

  dataPoints.forEach((tech, i) => {
    let count = 0
    for (const key in tech) {
      seriesFormat[count].data.push(tech[key])
      count++
    }
    count = 0
  });

  return seriesFormat
}

module.exports.createCategories = createCategories;
module.exports.extractDates = extractDates;
module.exports.extracDataPoints = extracDataPoints;



