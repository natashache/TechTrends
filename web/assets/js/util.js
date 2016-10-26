function createCategories(hubDataPoints){
  let keys = Object.keys(hubData[0]);
  let result = [];

  keys.forEach( (category) => {
    let categoryObject = {
      name: category,
      data: []
    };
    hubData.forEach( (dataPoint) => {
      categoryObject.data.push(dataPoint[category]);
    });
    result.push(categoryObject);
  });
  return result;
}

function extractDates(hubData){
  return hubData.map((data) => {
    return data.date;
  });
}

function extracDataPoints(hubData){
  return hubData.map((data) => {
    return data.data;
  });
}

module.exports.createCategories = createCategories;
module.exports.extractDates = extractDates;
module.exports.extracDataPoints = extracDataPoints;



