const inquirer = require('inquirer');
const request = require('request');
const async = require('async');
const cheerio = require('cheerio');
const keysMethods = require('./keys.js');
const promise = require('bluebird');
const utilities = require('./utilities.js');

const apiRoot = 'http://localhost:8000'
const apiEndpointGetDateIds = apiRoot + '/raw-postings/dates';
const apiEndpointRoot = apiRoot + '/raw-postings/';
const apiEndpointGetNumberOfRecords = apiRoot + '/raw-postings?date=';
const apiEndpointPostResults = apiRoot + '/analyzed-data';

//================ result ==================
//==========================================

// init: define an object to hold the count data for a date to be stored in prod
var crunched = keysMethods.getHubs();

// example output
// phoenix: {
//   javascriptFrameworks: {
//     123456789: {
//         angular: 7,
//         backbone: 5,
//         react: 6,
//         ember: 3,
//         knockout: 2,
//         aurelia: 1,
//         meteor: 0,
//         polymer: 1,
//         vue: 0,
//         mercury: 1
//     },
//     987654321,
//       data: {...}
//     }
//   },
//   serverTechnologies: {...},
//   databases: {...}
// },
// colorado: {...}

//========= js frameworks crunch ===========
//==========================================
const cruncherJSFrameworks = () => {
  
  // init: store a reference to the view currently being operated on
  const view = 'javascriptFrameworks';

  utilities.announce(`beginning crunch of ${view}`, {type: 'start', importance: 1});

  // init: add this data storge to results for this view
  for (var hub in crunched) crunched[hub][view] = {};
  
  // init: store a list of all the tech tracked for this view
  const tech = keysMethods.getTech(view);

  request.get(apiEndpointGetDateIds, (err, res, body) => {
    if (err) {
      utilities.announce(`error fetching date id's`, {type: 'error'});
    } else {
      
      // init: get and store hub listing
      const hubs = keysMethods.getHubs();
      
      // store fetched date id's
      var dateIds = JSON.parse(body);
      // filter out any test dates
      dateIds = dateIds.filter((date) => {
        return date > 1000000;
      });
      utilities.announce(`dates to be crunched this batch: ${dateIds}`, {type: 'note'});

      // init: tech count constructor
      const Bin = () => {
        var bin = {}
        for (var item in tech) {
          bin[item] = 0;
        }
        return bin;
      };

      // map all date id's to fetch functions to store in an async.series func
      // TODO break this out into a component function and not in the main body?
      const dates = dateIds.map((date) => {
        return (done) => {

          utilities.announce(`beginning fetch and parse for date ${date}`, {type: 'start', importance: 2});

          // add a count storage bin to each hub for this date
          for (var hub in crunched) {
            crunched[hub][view][date] = Bin();
          }
          
          const recordsCountUrl = apiEndpointGetNumberOfRecords + date + '&index=-1';

          request.get(recordsCountUrl, (err, res, body) => {
            if (err) {
              utilities.announce(`error fetching number of records for date id ${err}`, {type: 'error'});
            } else {
              
              // request length (number of records) for the current date slice and store it
              const numberOfRecords = body;
              utilities.announce('date id ' + date + ' has ' + numberOfRecords + ' records', {type: 'note'});
              
              if (numberOfRecords > 0) {

                var records = [];

                // for each record in a date, push a request/parse func to a series func
                for (var i = 0; i < numberOfRecords; i++) {
                  // construct the request url including this index
                  const thisRecordRequestUrl = `${apiEndpointRoot}?date=${date}&index=${i}`;
                  records.push((complete) => {
                    utilities.announce(`requesting record at url: ${thisRecordRequestUrl}`, {type: 'start'});
                    // request the specific record for the specific date
                    request
                      .get(thisRecordRequestUrl, (err, res, body) => {
                        if (err) {
                          utilities.announce(`error fetching record ${err}`, {type: 'error'});
                        } else {
                          utilities.announce(`record fetched successfully`, {type: 'success'});
                          body = JSON.parse(body);
                          // parse the response text value for tech and increment counters
                          for (var technology in tech) {
                            if (tech[technology].test(body.text)) { crunched[body.hub][view][date][technology]++; }
                          }
                          setTimeout(() => { complete() }, 500);
                        }
                      });
                  });
                }

                async.series(records, (err) => {
                  if (err) {
                    utilities.announce(`error fetching and/or parsing records for date ${date}  ${err}`, {type: 'error', importance: 2});
                  } else {
                    utilities.announce(`records fetched and parsed successfully for date ${date}`, {type: 'success', importance: 2});
                    done();
                  }
                });

              }
            }
          });
        };
      });
      
      async.series(dates, (err) => {
        if (err) {
          utilities.announce(`failed JS framework crunch ${err}`, {type: 'error', importance: 1});
        } else {
          utilities.announce(`saving results to prod database`, {type: 'start'});
          request.post('apiEndpointPostResults', crunched,(err, res) => {
            if (err) {
              utilities.announce(`failed to save results to prod database`, {type: 'error', importance: 1});
            } else {
              utilities.announce(`results saved to database`, {type: 'success'});
              utilities.announce(`JS framework crunch complete!`, {type: 'success', importance: 1});
            }
          });
        }
      });
    }
  });

};

cruncherJSFrameworks();
