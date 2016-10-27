const inquirer = require('inquirer');
const request = require('request');
const async = require('async');
const keysMethods = require('./keys.js');
const promise = require('bluebird');
const scraper = require('./scraper.js');

// TODO's:
// * make fetch content / pipe to DS one operation, combine methods
// * cleaner, less-suspicious request header
// * salary info

const hrSingle = '-----------------------------------------------------------------------------------';
const hrDouble = '===================================================================================';

// TODO: change this hard-coding when web server goes live
const api = 'http://localhost:8000/raw-postings';

inquirer.prompt([{
  type: 'confirm',
  name: 'confirm',
  message: 'Start the scrape? This process can take several hours. Begin:'
}])
  .then((answers) => {
    if (answers.confirm) {

      const queries = keysMethods.getQueries(), scrapeId = queries[0].date;

      console.log(hrDouble);
      console.log('beginning big scrape with batch id', scrapeId);
      console.log(hrDouble);
      
      const queue = queries.map((query) => {
        return (done) => {
          scraper.fetchRecordUrls(query)
            .then( scraper.fetchRecordContent)
            .then( scraper.storeRecords)
            .then(done);
        };
      });

      //execute the queries in series to avoid simultaneous requests
      async.series(queue, (err) => {
        if (err) { console.log(err); } else {
          console.log(hrDouble);
          console.log('finished big scrape, id', scrapeId, '-- have a great day!');
          console.log(hrDouble);
        }
      });

    } else {
      console.log('scrape aborted -- careerbuilder appreciates it <3');
    }
  });
