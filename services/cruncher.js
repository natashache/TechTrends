const inquirer = require('inquirer');
const request = require('request');
const fs = require('fs');
const path = require('path');
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

//============= example output =============
//==========================================

// example output before conversion
// phoenix: {
//   javascriptFrameworks: {
//     123456789: {
//      angular: 7,
//      backbone: 5,
//      react: 6,
//      ember: 3,
//      knockout: 2,
//      aurelia: 1,
//      meteor: 0,
//      polymer: 1,
//      vue: 0,
//      mercury: 1
//     },
//     987654321: {...}
//   },
//   serverTechnologies: {...},
//   databases: {...}
// },
// colorado: {...}

// example output after conversion
// phoenix: {
//   javascriptFrameworks: [
//     { date: 123456789,
//       data: {
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
//       }
//     },
//     { date: 987654321,
//       data: {...}
//     }
//   ],
//   serverTechnologies: [...],
//   databases: [...]
// },
// colorado: [...]

//================ cruncher ================
//==========================================
const cruncher = (dateId) => {

  // remove big crunch functionality for now
  // request.get(apiEndpointGetDateIds, (err, res, body) => {
  //   if (err) {
  //     utilities.announce(`error fetching date id's, ${err}`, {type: 'error'});
  //   } else {
      
      // init: un-converted result storage object
      var crunched = keysMethods.getHubs();
      
      // init: views to crunched
      const views = keysMethods.getTech();
      
      // init: add all views to all hubs
      for (const hub in crunched) {
        for (const view in views) {
          crunched[hub][view] = {};
        }
      }
      
      // // remove big crunch functionality for now
      // // store fetched date id's
      // var dateIds = JSON.parse(body);
      // // filter out any test dates
      // dateIds = dateIds.filter((date) => {
      //   return date > 1000000;
      // });
      const dateIds = [dateId];
      utilities.announce(`dates to be crunched this batch: ${dateIds}`, {type: 'note'});

      // init: tech count constructor
      const Bin = (tech) => {
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

          utilities.announce(`beginning fetch and parse for date ${date}, ${new Date(date)}`, {type: 'start', importance: 2});

          // add a container to each view for this date then add initialized tech counts to this container
          for (const hub in crunched) {
            for (const view in crunched[hub]) {
              crunched[hub][view][date] = Bin(views[view]);
            }
          }
          
          const recordsCountUrl = apiEndpointGetNumberOfRecords + date + '&index=-1';

          // get the number of records for the current date
          request.get(recordsCountUrl, (err, res, body) => {
            if (err) {
              utilities.announce(`error fetching number of records for date id ${err}`, {type: 'error'});
            } else {
              
              const numberOfRecords = body;
              utilities.announce('date id ' + date + ' has ' + numberOfRecords + ' records', {type: 'note'});
              
              if (numberOfRecords > 0) {

                var records = [];

                // for each record in a date, push a request/parse func to a series array
                for (var i = 0; i < numberOfRecords; i++) {
                  // construct the request url including this index
                  const thisIndex = i, thisRecordRequestUrl = `${apiEndpointRoot}?date=${date}&index=${thisIndex}`;
                  records.push((complete) => {
                    utilities.announce(`fetching record at index ${thisIndex} of ${numberOfRecords - 1}`, {type: 'start'});
                    // request the specific record for the specific date
                    request
                      .get(thisRecordRequestUrl, (err, res, body) => {
                        if (err) {
                          utilities.announce(`error fetching record ${err}`, {type: 'error'});
                        } else {
                          utilities.announce(`record fetched successfully, parsing technologies`, {type: 'success'});
                          body = JSON.parse(body);
                          // parse the response text value for tech and increment counters
                          for (const view in views) {
                            for (const tech in views[view]) {
                              if (views[view][tech].test(body.text)) crunched[body.hub][view][date][tech]++;
                            }
                          }
                          complete();
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
      
      // series loop to crunch all dates
      async.series(dates, (err) => {
        if (err) {
          utilities.announce(`failed crunch ${err}`, {type: 'error', importance: 1});
        } else {

          // convert results data into preferred prod db format
          var converted = {};
          for (const hub in crunched) {
            converted[hub] = {};
            for (const tech in crunched[hub]) {
              converted[hub][tech] = [];
              for (const date in crunched[hub][tech]) {
                converted[hub][tech].push({
                  date: date,
                  data: crunched[hub][tech][date]
                });
              }
            }
          }

          // save converted results to database
          utilities.announce(`saving results to prod database`, {type: 'start'});

          // TODO remove this after the cruncher works well
          fs.writeFile(path.join(__dirname + '/archive/' + dateId + '.json'), JSON.stringify(converted), (err) => {
            if (err) {
              utilities.announce(`failed to write to file`, {type: 'error'});
            } else {
              utilities.announce(`results written to file`, {type: 'success'});
              utilities.announce(`crunch complete!`, {type: 'success', importance: 1});
            }
          });
          
          request.post('apiEndpointPostResults', JSON.stringify(converted), (err, res) => {
            if (err) {
              // if write to db fails, save results to local disk to save time
              utilities.announce(`failed to save results to prod database, attempting to write to disk`, {type: 'error', importance: 1});
              // // remove big scrape functionality for now
              // fs.writeFile(path.join(__dirname + '/archive/' + new Date().getTime() + '.json'), JSON.stringify(converted), (err) => {
              //   if (err) {
              //     utilities.announce(`failed to write to file`, {type: 'error'});
              //   } else {
              //     utilities.announce(`results written to file`, {type: 'success'});
              //     utilities.announce(`crunch complete!`, {type: 'success', importance: 1});
              //   }
              // });

            } else {
              utilities.announce(`results saved to database`, {type: 'success'});
              utilities.announce(`crunch complete!`, {type: 'success', importance: 1});
            }
          });
        }
      });
    }
//  });

// };

inquirer.prompt([{
  type: 'input',
  name: 'date',
  message: 'Please enter the date id you\'d like to crunch:'
}])
  .then((answers) => {
    if (answers.date) cruncher(answers.date);
    else utilities.announce(`please enter a valid date id to begin`, {type: 'error'});
  }); 
