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



//getDataFromServer should return data in this format
// {
//   javascriptFrameworks: {
//     date: Array,
//     data: Array
//   }
//   serverLanguages: {
//     date: Array,
//     data: Array
//   }
//   databaseLanguages: {
//     date: Array,
//     data: Array
//   }
//   contentManagementSystems: {
//     date: Array,
//     data: Array
//   }
//   upAndComingLanguages: {
//     date: Array,
//     data: Array
//   }
//   javascriptMarkup: {
//     date: Array,
//     data: Array
//   }
//   versionControlSystems: {
//     date: Array,
//     data: Array
//   }
// }




