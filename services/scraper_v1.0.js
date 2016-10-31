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

const fetchRecordUrls = (query) => {
  return new Promise((resolve, reject) => {

    utilities.announce(`beginning surface scrape of ${query.hub} at ${query.start}`, {type: 'start', importance: 2});

    var records = [];

    const source = keysMethods.getSource(query.source);

    var pageCount = 1;
      
    const parseUrls = (url) => {
      
      request.get(url, (err, response, html) => {
        if (!err) {

          if (response.statusCode === 200) {

            utilities.announce(`fetching record urls from ${url}`, {type: 'start'});
          
            const $ = cheerio.load(html);
            
            const urls = $('body').find(source.elemRecordLink);
            
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

            setTimeout(() => {
              pageCount++;
              parseUrls(query.start + source.urlPage + pageCount)
            }, 2000);
          
          } else {
            utilities.announce(`finished surface scrape of ${records[0].hub}`, {type: 'success', importance: 1});
            resolve({records: records, source: source});
          }
        } else {
          reject(console.log(err));
        }
      });
    };

    parseUrls(query.start + source.urlPage + pageCount);

  });
};

const fetchRecordContent = (obj) => {

  return new Promise((resolve, reject) => {

    const fetches = obj.records.map((record) => {
      return (done) => {
        request.get(record.url, (error, response, html) => {
          if (error) {
            reject(error);
            setTimeout(() => { done(err); }, 2000);
          } else {
            const $ = cheerio.load(html);
            record.text = $('body').find(obj.source.elemRecordBody).text().toLowerCase();
            setTimeout(() => { done(null); }, 2000);
          }
        });
      };
    });

    const thisHub = obj.records[0].hub;
    
    utilities.announce(`beginning deep scrape of ${thisHub}`, {type: 'start', importance: 2});

    async.series(fetches, (err) => {
      if (err) {
        reject(err);
      } else {
        utilities.announce(`finished deep scrape of ${thisHub}`, {type: 'success', importance: 2});
        resolve(obj.records);
      }
    });
  
  });
};

const storeRecords = (records) => {

  return new Promise((resolve, reject) => {

    const writes = records.map((record) => {
      return (done) => {
        request({
          url: api,
          method: 'POST',
          json: record
        }, (error, response, body) => {
          if (error) {
            utilities.announce(`error writing record to database, record at ${record.url}, ${error}`, {type: 'error'});
            setTimeout(() => { done(error); }, 500);
          } else {
            utilities.announce(`record written for url ${record.url} in ${record.hub} to database`, {type: 'success'});
            setTimeout(() => { done(null); }, 500);
          }
            
        }); 
      };
    });

    async.series(writes, (err) => {
      if (err) {
        utilities.announce(`error writing records to database ${err}`, {type: 'error'});
        reject(err);
      } else {
        resolve('');
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
            .then(fetchRecordContent)
            .then(storeRecords)
            .then(done);
        };
      });

      async.series(queue, (err) => {
        if (err) { console.log(err); } else {
          utilities.announce(`finished big scrape ${scrapeId} -- have a great day!`, {type: 'success', importance: 1});
        }
      });

    } else {
      utilities.announce(`scrape aborted`, {type: 'note'});
    }
  });
