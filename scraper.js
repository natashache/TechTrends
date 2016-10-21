const fs = require('fs');
const request = require('request');
const series = require('async-series');
const cheerio = require('cheerio');
const keysMethods = require('./services/keys.js');
const promise = require('bluebird');

const queries = keysMethods.getQueries();

// TODO: need recursive call for all pages; remove id
const fetchRecordUrls = function(queries) {
  return new Promise(function(resolve, reject) {

    var records = [];

    queries.forEach(function(query) {
      
      const parseUrls = function(url) {
        request.get(url, function(err, response, html) {
          if (!err) {
            
            const $ = cheerio.load(html);

            const urls = $('body').find('h2.job-title a'); // TODO: abstract this into source utility
            
            Object.keys(urls).forEach(function(listing) {
              if (urls[listing].attribs !== undefined) {
                
                var record = {
                  id: '', // TODO: remove?
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
                record.url = 'http://www.careerbuilder.com' + record.url.split('?')[0]; // TODO: abstract this into source utility
                record.id = Math.random() * 100000000000000000000;  // TODO: remove
                
                records.push(record);
              }
            });

            // TODO: recursive logic here to check for additional pages and feed them back into this fetch until all are listed

            resolve(records);
          
          } else {
            reject(console.log(err));
          }
        });
      };

      parseUrls(query.start);
    
    });
  });
};

// TODO: this needs to be throttled, ASAP
const fetchRecordContent = function(records) {
  return new Promise(function(resolve, reject) {

    const fetches = records.map(function(record) {
      return function(done) {
        request.get(record.url, function(error, response, html) {
          if (!error) {
            
            const $ = cheerio.load(html);
            
            record.text = $('body').find('.description').text().toLowerCase(); // TODO: abstract this into source utility

            done();

          } else {
            reject(error);
          }
        });
      };
    });

    series(fetches, function(err, results) {
      if (!err) {
        resolve(records);
      } else {
        reject(err);
      }
    });
  
  });

};

// TODO: replace with write to DB
const storeRecords = function(records) {

  records.forEach(function(record) {
    fs.writeFile((__dirname + '/services/records/' + record.id + '.txt'), JSON.stringify(record), function(err) {
      if (err) console.log(err);
    });
  });

};

fetchRecordUrls(queries)
  .then(fetchRecordContent)
  .then(storeRecords);
