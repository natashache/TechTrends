const mongoose = require("mongoose");
const _ = require('underscore');

var AnalyzedSchema = new mongoose.Schema(
  {
    hub: String,
    javascriptFrameworks: Array,
    serverLanguages: Array,
    databaseLanguages: Array,
    contentManagementSystems: Array,
    upAndComingLanguages: Array,
    javascriptMarkup: Array,
    versionControlSystems: Array
  }, {strict:false}
);

//todo: error handling for non-existent views
AnalyzedSchema.methods.addAnalytic = function (newAnalytic,view, cb) {

  this[view].push(newAnalytic);
  this.save()
    .then( (saved) => {
      cb(saved);
    });
};

AnalyzedSchema.methods.updateViews = function (viewsArray, cb) {
  viewsArray.forEach((view) => {
    let viewName = view.viewName;
    let data = view.item;
    this[viewName].push(data);
  });
  this.save()
    .then( (saved) => {
      cb(saved);
    });
}

let AnalyzedModel = mongoose.model('analyzed', AnalyzedSchema);

module.exports = AnalyzedModel;