const inquirer = require('inquirer');
const request = require('request');
const async = require('async');
const keysMethods = require('./keys.js');
const promise = require('bluebird');
const scraper = require('./scraper.js');
const utilities = require('./utilties.js');

inquirer.prompt([{
  type: 'confirm',
  name: 'confirm',
  message: 'Start the scrape? This process can take several hours. Begin:'
}])
  .then((answers) => {
    if (answers.confirm) {

      const queries = keysMethods.getQueries(), scrapeId = queries[0].date;

      utilities.announce(`beginning big scrape with date ids ${scrapeId}`, {type: 'start', importance: 1});
      
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
          utilities.announce(`finished big scrape ${scrapeId} -- have a great day!`, {type: 'success', importance: 1});
        }
      });

    } else {
      utilities.announce(`scrape aborted`, {type: 'note'});
    }
  });
