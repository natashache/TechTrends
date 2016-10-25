const inquirer = require('inquirer');
const request = require('request');
const async = require('async');
const cheerio = require('cheerio');
const keysMethods = require('./services/keys.js');
const promise = require('bluebird');

// TODO's:
// * make fetch content / pipe to DS one operation, combine methods
// * cleaner, less-suspicious request header

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
          
          console.log(hrSingle);
          console.log('beginning scrape of', query.hub, 'at', query.start);
          console.log(hrSingle);

          const source = keysMethods.getSource(query.source);

          var pageCount = 1;
            
          const parseUrls = (url) => {
            
            request.get(url, (err, response, html) => {
              if (err) {
                
                // TODO: error handling
              
              } else if (response.statusCode === 200) {

                console.log('fetching record urls from ' + url, '...',  response.statusCode);
              
                const $ = cheerio.load(html);
                
                const urls = $('body').find(source.elemRecordLink);
                
                const fetches = Object.keys(urls).map((listing) => {
                  return (complete) => {
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
                      
                      request
                        .get(record.url)
                        .on('error', function(err) {
                          console.log('[X] error fetching record', err);
                        })
                        .on('response', function(response) {
                          console.log('[ ] record fetched successfully');
                          const $ = cheerio.load(html);
                          record.text = $('body').find(source.elemRecordBody).text().toLowerCase();
                          request({
                            url: api,
                            method: 'POST',
                            json: record
                          }, (error, response, body) => {
                            if (error) {
                              complete('[X] error writing record', record.url, 'to database, error info:', error);
                            } else {
                              console.log('[ ] record written for url', record.url, 'in hub', record.hub, 'to database');
                              // setTimeout(() => { done(); }, 2000);
                            }
                          });
                        });

                    }
                  };
                
                });

                pageCount++;
                parseUrls(query.start + source.urlPage + pageCount)
                
              } else if (response.statusCode === 404) {
                
                console.log(hrSingle);
                console.log('finished scrape of', query.hub, 'at', query.start);
                console.log(hrSingle);
              
              }
            });
          };

          parseUrls(query.start + source.urlPage + pageCount);
        
        };
      });

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


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const doAllTheThings = (query) => {
  return new Promise((resolve, reject) => {

    console.log(hrSingle);
    console.log('beginning surface scrape of', query.hub, 'at', query.start);
    console.log(hrSingle);

    const source = keysMethods.getSource(query.source);

    var pageCount = 1;
      
    const parseUrls = (url) => {
      
      request.get(url, (err, response, html) => {
        if (!err) {

          if (response.statusCode === 200) {

            console.log('fetching record urls from ' + url, '...',  response.statusCode);
          
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
                
                request
                  .get(record.url)
                  .on('error', function(err) {
                    console.log('[X] could not fetch record', err);
                  })
                  .on('response', function(response) {
                    const $ = cheerio.load(html);
                    record.text = $('body').find(obj.source.elemRecordBody).text().toLowerCase();
                    request({
                      url: api,
                      method: 'POST',
                      json: record
                    }, (error, response, body) => {
                      if (!error) {
                        console.log('record written for url', record.url, 'in hub', record.hub, 'to database');
                        // setTimeout(() => { done(); }, 2000);
                      } else {
                        console.log('error writing record to database, record at`', record.url, error);
                        // setTimeout(() => { done(); }, 2000);
                      }
                    });
                  });

              }
            });

            setTimeout(() => {
              pageCount++;
              parseUrls(query.start + source.urlPage + pageCount)
            }, 2000);
          
          } else {
            console.log(hrSingle);
            console.log('finished surface scrape of', records[0].hub);
            console.log(hrSingle);
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

const fetchAndStoreRecordContent = (obj) => {

  request
    .get(obj.record.url)
    .on('error', function(err) {
      console.log('[X] could not fetch record', err);
    })
    .on('response', function(response) {
      const $ = cheerio.load(html);
      obj.record.text = $('body').find(obj.source.elemRecordBody).text().toLowerCase();
      request({
        url: api,
        method: 'POST',
        json: obj.record
      }, (error, response, body) => {
        if (!error) {
          console.log('record written for url', obj.record.url, 'in hub', record.hub, 'to database');
          // setTimeout(() => { done(); }, 2000);
        } else {
          console.log('error writing record to database, record at`', record.url, error);
          // setTimeout(() => { done(); }, 2000);
        }
      });
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

    const thisHub = obj.records[0].hub;
    
    console.log(hrSingle);
    console.log('beginning deep scrape of', thisHub);
    console.log(hrSingle);

    async.series(fetches, (err, results) => {
      if (err) {
        reject(err);
      } else {
        console.log(hrSingle);
        console.log('finished deep scrape of', thisHub)
        console.log(hrSingle);
        resolve(obj.records);
      }
    });
  
  });
};

const storeRecords = (records) => {

  const writes = records.map((record) => {
    return (done) => {
      request({
        url: api,
        method: 'POST',
        json: record
      }, (error, response, body) => {
        if (!error) {
          console.log('record written for url', record.url, 'in hub', record.hub, 'to database');
          setTimeout(() => { done(); }, 500);
        } else {
          console.log('error writing record to database, record at`', record.url, error);
          setTimeout(() => { done(); }, 500);
        }
      }); 
    };
  });

  async.series(writes, (err) => {
    if (err) {
      console.log('error writing records to database', err);
      reject(err);
    }
  }, () => {
    resolve('');
  });

};