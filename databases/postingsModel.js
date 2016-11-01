var mongoose = require("mongoose");

var PostingsSchema = new mongoose.Schema({date: String, postings: Array});

//handles adding a new posting to the record's postings array
PostingsSchema.methods.addPosting = function (posting, cb) {
  this.postings.push(posting);
  this.save().then((saved)=>{
    cb(saved);
  });
};

var PostingsModel = mongoose.model('collection',PostingsSchema);

module.exports = PostingsModel;