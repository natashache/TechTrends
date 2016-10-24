const mongoose = require("mongoose");
const _ = require('underscore');

var AnalyzedSchema = new mongoose.Schema(
  {
    date: String, 
    hub: String,
    analytics: Object
  }
);

AnalyzedSchema.methods.addAnalytic = function (newAnalytic, cb) {
 _.extend(this.analytics, newAnalytic);
 cb(this);
};

let AnalyzedModel = mongoose.model('collection', AnalyzedSchema);

module.exports = AnalyzedModel;