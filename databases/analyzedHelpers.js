const AnalyzedModel = require("./analyzedModel.js");
const _ = require("underscore");

//creates a new date/hub collections, and extends its analytics object with passed analytic
const createAnalyticCollection = function (analyticObject, callback) {

  AnalyzedModel.create({hub: analyticObject.hubName})
    .then( (created) => {
      created.save()
        .then(  (saved) => {
          saved.updateViews(analyticObject.views, (updatedHub) => {
            callback(updatedHub);
          })
      });
    });
};

//handles getting hub names
const getHubs = function(callback){ 
  AnalyzedModel.find()
    .then((arrayOfHubs) => {
      callback(arrayOfHubs.map( hub => hub.hub));
    });
};

const getViewsList = function(callback){ 
  AnalyzedModel.find()
    .then((arrayOfHubs) => {
      var x = arrayOfHubs[0].schema.paths;
      var arr = [];
      for(var prop in x){
        if(prop!== "hub" && prop[0] !== "_"){
          arr.push(prop);
        }
      }
      callback(arr);
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
  AnalyzedModel.findOne({hub: analyticObject.hubName})
    .then((analytic) => {
      if(analytic){
        console.log(`hub ${analyticObject.hubName} exists, adding datapoints to views`);

        analytic.updateViews(analyticObject.views, (updatedHub) => {
          callback(updatedHub);
        });
        
      } else {
        console.log(`hub ${analyticObject.hubName} does not exiss, creating new hub record`);
        createAnalyticCollection(analyticObject, callback);
      }
    });
};

//handles getting analytics
const getAnalytics = function (hub,view, callback) {
  AnalyzedModel.find({hub: hub})
    .then((hubObject) => {

      if(hubObject.length === 0) {
        callback(false);
        return;
      }

      if(view) {
        callback(hubObject[0][view]);
      } else {
        let returnObj = {};
    
        Object.keys(hubObject[0]._doc).forEach( (key) => {
          if(key !== "__v" && key !== "_id" && key !== "hub"){
            returnObj[key] = hubObject[0]._doc[key];
          }
        });

        callback(returnObj);
      }
    });

  };


module.exports.getHubs = getHubs;
module.exports.createAnalyticCollection = createAnalyticCollection;
module.exports.deleteAnalyticCollection = deleteAnalyticCollection;
module.exports.addNewAnalytic = addNewAnalytic;
module.exports.getAnalytics = getAnalytics;
module.exports.getViewsList = getViewsList;
