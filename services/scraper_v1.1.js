const inquirer = require('inquirer');
const request = require('request');
const async = require('async');
const cheerio = require('cheerio');
const keysMethods = require('./keys.js');
const promise = require('bluebird');
const utilities = require('./utilities.js');

// TODO's:
// * make fetch content / pipe to DS one operation, combine methods
// * cleaner, less-suspicious request header
// * salary info, title

// TODO: change this hard-coding when web server goes live
const api = 'http://localhost:8000/raw-postings';

// count number of records processed
var recordCount = 0;

// thorttle speed in ms
const throttle = 1000;

// scan entry url's for each hub, create records, and scrape record url's
const fetchRecordUrls = (query) => {
  return new Promise((resolve, reject) => {

    utilities.announce(`beginning surface scrape of ${query.hub} at ${query.start}`, {type: 'start', importance: 2});

    var records = [];

    // source for this scrape
    const source = keysMethods.getSource(query.source);

    // counter to keep track of what page of results scraper is currently on
    var pageCount = 1;
      
    // recursive function to create records for each page of results
    const parseUrls = (url) => {
      
      // request results page
      request.get(url, (err, response, html) => {
        if (!err) {

          // if response is not 200, short-circuit the function
          if (response.statusCode === 200) {

            utilities.announce(`fetching record urls from ${url}`, {type: 'start'});
          
            // parse the html and locate the records
            const $ = cheerio.load(html);
            const urls = $('body').find(source.elemRecordLink);
            
            // create a record object for each posting found in the results page and populate the object
            Object.keys(urls).forEach((listing) => {
              if (urls[listing].attribs !== undefined) {
                
                var record = {
                  date: query.date,
                  country: query.country,
                  state: query.state,
                  hub: query.hub,
                  source: query.source,
                  term: query.term,
                  url: '',
                  text: ''
                };
                
                record.url = urls[listing].attribs.href;
                record.url = source.urlRoot + record.url.split('?')[0];
                records.push(record);
              }
            });

            // wait X seconds then recursively call the function again with the next page
            setTimeout(() => {
              pageCount++;
              parseUrls(query.start + source.urlPage + pageCount)
            }, throttle);
          
          } else {
            utilities.announce(`finished surface scrape of ${records[0].hub}`, {type: 'success', importance: 1});
            resolve({records: records, source: source});
          }
        } else {
          reject(console.log(err));
        }
      });
    };

    // call first cycle of recursive parseUrl function
    parseUrls(query.start + source.urlPage + pageCount);

  });
};

const processRecords = (obj) => {

  return new Promise((resolve, reject) => {

    const fetches = obj.records.map((record) => {
      return (complete) => {
        
        // scrape the record content
        request.get(record.url, (err, res, html) => {
          if (err) {
            utilities.announce(`failed to scrape record content for ${record.url}, ${error}`, {type: 'error'});
            reject(error);
          } else {
            // select the page body content
            const $ = cheerio.load(html);
            //scrub out html
            record.text = $('body').find(obj.source.elemRecordBody).text().toLowerCase();
            
            // store scraped and scrubbed content in raw db
            request({
              url: api,
              method: 'POST',
              json: record
            }, (err) => {
              if (err) {
                utilities.announce(`error writing record to raw db, record at ${record.url} in ${record.hub}, ${error}`, {type: 'error'});
                setTimeout(() => { complete(err); }, throttle);
              } else {
                utilities.announce(`record scraped and written to raw db; ${record.url}`, {type: 'success'});
                recordCount++;
                setTimeout(() => { complete(null); }, throttle);
              }
            });
          }
        });
      };
    });

    // set hub variable for tagging reference
    const thisHub = obj.records[0].hub;
    
    utilities.announce(`beginning deep scrape of ${thisHub}`, {type: 'start', importance: 2});

    async.series(fetches, (err) => {
      if (err) {
        reject(err);
      } else {
        utilities.announce(`finished deep scrape of ${thisHub}`, {type: 'success', importance: 2});
        resolve();
      }
    });
  
  });
};

inquirer.prompt([{
  type: 'confirm',
  name: 'confirm',
  message: 'Start the scrape? This process can take several hours. Begin:'
}])
  .then((answers) => {
    if (answers.confirm) {

      const queries = keysMethods.getQueries(), scrapeId = queries[0].date;

      utilities.announce(`beginning big scrape with date id ${scrapeId}`, {type: 'start', importance: 1});
      
      const queue = queries.map((query) => {
        return (done) => {
          fetchRecordUrls(query)
            .then(processRecords)
            .then(done);
        };
      });

      async.series(queue, (err) => {
        if (err) {
          console.log(err);
        } else {
          utilities.announce(`finished big scrape ${scrapeId} with ${recordCount} records created`, {type: 'success', importance: 1});
        }
      });

    } else {
      utilities.announce(`scrape aborted`, {type: 'note'});
    }
  });
