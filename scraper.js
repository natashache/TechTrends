const fs = require('fs');
const request = require('request');
const series = require('async-series');
const cheerio = require('cheerio');
const keysMethods = require('./services/keys.js');
const promise = require('bluebird');

// TODO: undo this hard-coding

const dbUrl = 'http://localhost:8000/raw-postings';

// TODO: need recursive call for all pages; remove id
const fetchRecordUrls = (query) => {
  return new Promise((resolve, reject) => {

    var records = [];

    const source = keysMethods.getSource(query.source);
      
    const parseUrls = (url) => {
      request.get(url, (err, response, html) => {
        if (!err) {
          
          const $ = cheerio.load(html);
          
          const urls = $('body').find(source.elemRecordLink); // TODO: abstract this into source utility
          
          Object.keys(urls).forEach((listing) => {
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
              record.url = source.urlRoot + record.url.split('?')[0]; // TODO: abstract this into source utility
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
};

// TODO: this needs to be throttled, ASAP
const fetchRecordContent = (records) => {
  return new Promise((resolve, reject) => {

    const fetches = records.map((record) => {
      return (done) => {
        request.get(record.url, (error, response, html) => {
          if (!error) {
            const $ = cheerio.load(html);
            record.text = $('body').find('.description').text().toLowerCase(); // TODO: abstract this into source utility
            done();
          } else {
            reject(error);
            done();
          }
        });
      };
    });

    series(fetches, (err, results) => {
      if (!err) {
        resolve(records);
      } else {
        reject(err);
      }
    });
  
  });
};

const storeRecords = (records) => {

  const writes = records.map((record) => {
    return (done) => {
      request.post(dbUrl, JSON.stringify(record), (error, response, body) => {
        if (!error) {
          done();
        } else {
          console.log('error writing record to database', error);
          done();
        }
      }); 
    };
  });

  series(writes, (err) => {
    if (err) console.log('error writing record to database, err');
  });

  // fs.writeFile((__dirname + '/services/records/' + record.id + '.txt'), JSON.stringify(record), function(err) {
  //   if (err) console.log(err);
  // });

};

const queries = keysMethods.getQueries();

queries.forEach((query) => {
  fetchRecordUrls(query)
    .then(fetchRecordContent)
    .then(storeRecords);
});
