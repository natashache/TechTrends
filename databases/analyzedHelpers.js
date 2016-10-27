const AnalyzedModel = require("./analyzedModel.js");
const _ = require("underscore");

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
            //console.log("added new analytic", savedObject);
            callback(savedObject);
          })
      })
    });
};

//handles getting hub names
const getHubs = function(callback){ 
  AnalyzedModel.find()
    .then((arrayOfHubs) => {
      console.log("list of hubs", arrayOfHubs.map( hub => hub.hub));
      callback(arrayOfHubs.map( hub => hub.hub));
    });
};

//handles deleting a record
const deleteAnalyticCollection = function (hub, callback) {
  if(hub === "0"){
    AnalyzedModel.remove().then(results =>{
      callback(results); 
    });
  }
  else {
    AnalyzedModel.remove({hub: hub}).then( results => {
      callback(results);
    });
  }
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
        //console.log(`hub exists, adding to the ${analyticObject.viewName} array`);
        analytic.addAnalytic(dataPoint, analyticObject.viewName, callback);
      } else {
        //console.log("creating new hub");
        createAnalyticCollection(analyticObject, callback);
      }
    });
};

//handles getting analytics
const getAnalytics = function (hub,view, callback) {
  AnalyzedModel.find({hub: hub})
    .then((hubObject) => {
      if(view) {
        callback(hubObject[0][view]);
      } else {
        callback(hubObject[0]);
      }
    });

  };


module.exports.getHubs = getHubs;
module.exports.createAnalyticCollection = createAnalyticCollection;
module.exports.deleteAnalyticCollection = deleteAnalyticCollection;
module.exports.addNewAnalytic = addNewAnalytic;
module.exports.getAnalytics = getAnalytics;
