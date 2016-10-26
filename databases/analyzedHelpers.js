const AnalyzedModel = require("./analyzedModel.js");

//creates a new date/hub collections, and extends its analytics object with passed analytic
const createAnalyticCollection = function (analyticObject, callback) {
  AnalyzedModel.create({hub: analyticObject.hub})
    .then( (created) => {
      created.save()
        .then(  (saved) => {
          let dataPoint  = {
            date: analyticObject.date,
            data: analyticObject.data
          };

          created.addAnalytic(dataPoint, analyticObject.viewName, (savedObject) => {
            console.log("added new analytic", savedObject);
            callback(savedObject);
          })
      })
    });
};

//handles adding a new analytic
const addNewAnalytic = function (analyticObject, callback) {
  AnalyzedModel.findOne({hub: analyticObject.hub})
    .then((analytic) => {
      if(analytic){
        let dataPoint  = {
            date: analyticObject.date,
            data: analyticObject.data
        };
        console.log(`hub exists, adding to the ${analyticObject.viewName} array`);
        analytic.addAnalytic(dataPoint, analyticObject.viewName, callback);
      } else {
        console.log("creating new hub");
        createAnalyticCollection(analyticObject, callback);
      }
    });
};

//handles getting analytics
const getAnalytics = function (hub,view, callback) {
  analyzedModel.find({hub: hub})
    .then((hubObject) => {
      callback(hubObject.view);
    });
};


module.exports.createAnalyticCollection = createAnalyticCollection;
module.exports.addNewAnalytic = addNewAnalytic;
module.exports.getAnalytics = getAnalytics;
