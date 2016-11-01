const PostingsModel = require("./postingsModel.js");

// handles creating a new date collections and pushes into its
// posting array
const createCollection = function (postingObject, callback) {
  PostingsModel.create({date: postingObject.date})
    .then( (created) => {
      created.save().then( (saved) => {
          saved.addPosting(postingObject, (newPosting) => {
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
        posting.addPosting(postingObject, callback);
      } else {
        createCollection(postingObject, callback);
      }
    });
};

//handles getting the postings at the passed in date, if date is 0 returns all postings
const getPostings = function(date,callback){
  if(date === '0'){
    PostingsModel.find().then(results =>{
      callback(results); 
    });
  }
  else {
    PostingsModel.find({date: date}).then( results => {
      callback(results);
    });
  }
};

//returns the record the passed index of the postings array in the passed date recod
//if index is -1 retunrs instead the length of the postings array for future iteration
const iterateDatelist = function(date,index,callback){
  if(index === '-1'){
    PostingsModel.find({date: date}).then(results =>{
      callback(results[0].postings.length); 
    });

  } else {
    PostingsModel.find({date: date}).then( results => {
      if(results[0].length<index){
        callback('index out of bounds')
      } else {
        callback(results[0].postings[index]);
      }
    });

  }

};

//returns an array of all date records contained in the DB
const getAllDates = function(callback){
  PostingsModel.find().then(results=>{
    var dates = results.reduce(function(acc,result){
      acc.push(result.date);
      return acc;
    },[]);
    callback(dates);
  });
}

//handles deleting a specific date/hub record
const deletePostings = function(date, hub, callback){
  if(date === 0){
    PostingsModel.remove().then(results =>{
      callback(results); 
    });
  }
  else {
    if (!hub) {
      PostingsModel.remove({date: date}).then( results => {
        callback(results);
      });
    } else {
      PostingsModel.findOne({date:date})
        .then( (dateObject) => {
          var removed = dateObject.postings.filter( (posting) => {
            return posting.hub == hub;
          })
        
          dateObject.postings = dateObject.postings.filter( (posting) => {
            return posting.hub !== hub;
          });

          dateObject.save()
            .then( (saved) => {
              callback(removed);
            });
        });
    }
    
  }
};

module.exports.createCollection = createCollection;
module.exports.addNewPosting = addNewPosting;
module.exports.getPostings = getPostings;
module.exports.deletePostings = deletePostings;
module.exports.iterateDatelist = iterateDatelist;
module.exports.getAllDates = getAllDates;

