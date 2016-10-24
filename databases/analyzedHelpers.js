const AnalyzedModel = require("./analyzedModel.js");

//creates a new date/hub collections, and extends its analytics object with passed analytic
const createAnalyticCollection = function (analyticObject, callback) {
  AnalyzedModel.create({date: analyticObject.date, hub: analyticObject.hub, analytics: {}})
    .then( (created) => {
      created.save()
        .then(  (saved) => {
          delete analyticObject.date;
          delete analyticObject.hub;

          created.addAnalytic(analyticObject, (extendedObject) => {
            console.log("added new analytic", extendedObject);
          })
      })
    });
};

//handles adding a new analytic
const addNewAnalytic = function (analyticObject, callback) {
  AnalyzedModel.findOne({date: analyticObject.date, hub: analyticObject.hub})
    .then((analytic) => {
      if(analytic){
        console.log("date/hub exists, extending the analytics object");
        analytic.addAnalytic(analyticObject, callback);
      } else {
        console.log("creating new date/hub");
        createAnalyticCollection(analyticObject, callback);
      }
    });
};

//handles getting analytics
const getAnalytics = function (hub, callback) {
  analyzedModel.find({hub: hub})
    .then((analyticArray) => {
      callback(analyticArray);
    });
};


module.exports.createCollection = createCollection;
module.exports.addNewPosting = addNewPosting;
module.exports.getPostings = getPostings;
module.exports.deletePostings = deletePostings;