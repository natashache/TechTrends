const PostingsModel = require("./postingsModel.js");

// handles creating a new date collections and pushes into its
// posting array
const createCollection = function (postingObject, callback) {
  PostingsModel.create({date: postingObject.date})
    .then( (created) => {
      created.save().then( (saved) => {
          saved.addPosting(postingObject, (newPosting) => {
            //console.log("added new posting", newPosting);
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
        //console.log("date already exists");
        posting.addPosting(postingObject, callback);
      } else {
        //console.log("creating new date");
        createCollection(postingObject, callback);
      }
    });
};

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

const iterateDatelist = function(date,index,callback){
  if(index === '-1'){
    PostingsModel.find({date: date}).then(results =>{
      //console.log('full results',results);
      //console.log('datelist postings length',results[0].postings.length);
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

const deletePostings = function(date, hub, callback){
  if(date === 0){
    //console.log('removing all...')
    PostingsModel.remove().then(results =>{
      //console.log('remove results',results);
      callback(results); 
    });
  }
  else {
    if (!hub) {
      PostingsModel.remove({date: date}).then( results => {
        callback(results);
      });
    } else {
      console.log("heard delete in correct conditional")
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

