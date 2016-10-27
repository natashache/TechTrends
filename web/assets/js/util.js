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
    return moment.unix(data.date).format('MMMM DD'); //change format later
  });
}

function extracDataPoints(hubData){
  return hubData.map((data) => {
    return data.data;
  });
}

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



