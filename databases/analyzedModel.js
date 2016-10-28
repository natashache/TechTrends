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
  console.log(`called on the ${this.hub} ${view} view`);
  this[view].push(newAnalytic);
  this.save()
    .then( (saved) => {
      console.log("saved view array", saved);
      cb(saved);
    });
};

let AnalyzedModel = mongoose.model('analyzed', AnalyzedSchema);

module.exports = AnalyzedModel;