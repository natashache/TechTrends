const request = require('request');
const async = require('async');
const cheerio = require('cheerio');
const keysMethods = require('./services/keys.js');
const promise = require('bluebird');

// TODO: change this hard-coding when web server goes live
const api = 'http://localhost:8000/raw-postings';

const fetchRecordUrls = (query) => {
  return new Promise((resolve, reject) => {

    var records = [];

    const source = keysMethods.getSource(query.source);

    var pageCount = 1;
      
    const parseUrls = (url) => {
      
      request.get(url, (err, response, html) => {
        if (!err) {

          if (response.statusCode === 200) {

            console.log('fetching urls from ' + url, '...',  response.statusCode);
          
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
            resolve({records: records, source: source});
          }
        } else {
          reject(console.log(err));
        }
      });
    };

    console.log('begin query at', query.start);
    parseUrls(query.start + source.urlPage + pageCount);

  });
};

const fetchRecordContent = (obj) => {

  return new Promise((resolve, reject) => {

    const fetches = obj.records.map((record) => {
      return (done) => {
        request.get(record.url, (error, response, html) => {
          if (!error) {
            const $ = cheerio.load(html);
            record.text = $('body').find(obj.source.elemRecordBody).text().toLowerCase();
            setTimeout(() => { done(); }, 2000);
          } else {
            reject(error);
            setTimeout(() => { done(); }, 2000);
          }
        });
      };
    });

    async.series(fetches, (err, results) => {
      if (!err) {
        resolve(obj.records);
      } else {
        reject(err);
      }
    });
  
  });
};

const storeRecords = (records) => {

  const writes = records.map((record) => {
    return (done) => {
      request.post(api, JSON.stringify(record), (error, response, body) => {
        if (!error) {
          console.log('record written from url', record.url, 'to database');
          done();
        } else {
          console.log('error writing record to database', error);
          done();
        }
      }); 
    };
  });

  async.parallel(writes, (err) => {
    if (err) console.log('error writing records to database', err);
  });

};

const queries = keysMethods.getQueries();

queries.forEach((query) => {
  fetchRecordUrls(query)
    .then(fetchRecordContent)
    .then(storeRecords);
});
