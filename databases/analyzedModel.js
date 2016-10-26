const mongoose = require("mongoose");
const _ = require('underscore');

var AnalyzedSchema = new mongoose.Schema(
  {
    hub: String,
    javaScriptFrameWorks: Array
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

let AnalyzedModel = mongoose.model('analyzed', AnalyzedSchema);

module.exports = AnalyzedModel;