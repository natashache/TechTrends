const PostingsModel = require("./postingsModel.js");

// handles creating a new date collections and pushes into its
// posting array
const createCollection = function (postingObject, callback) {
  PostingsModel.create({date: postingObject.date})
    .then( (created) => {
      created.save().then( (saved) => {
          saved.addPosting(postingObject, (newPosting) => {
            console.log("added new posting", newPosting);
            callback(newPosting);
          })
        })
    });
};

//handles adding a new post, takes care of already existing dates and 
//creating new dates
const addNewPosting = function(postingObject, callback) {
  PostingsModel.findOne({date: postingObject.date})
    .then((posting) => {
      if(posting){
        console.log("date already exists");
        posting.addPosting(postingObject, callback);
      } else {
        console.log("creating new date");
        createCollection(postingObject, callback);
      }
    });
};

const getPostings = function(date,callback){
  if(date === '0'){
    PostingsModel.find().then(results =>{
      console.log('get results',results)
      callback(results); 
    });
  }
  else {
    PostingsModel.find({date: date}).then( results => {
      console.log("get results",results)
      callback(results);
    });
  }
};

const deletePostings = function(date,callback){
  if(date === '0'){
    PostingsModel.remove().then(results =>{
      callback(results); 
    });
  }
  else {
    PostingsModel.remove({date: date}).then( results => {
      callback(results);
    });
  }
};

module.exports.createCollection = createCollection;
module.exports.addNewPosting = addNewPosting;
module.exports.getPostings = getPostings;
module.exports.deletePostings = deletePostings;

