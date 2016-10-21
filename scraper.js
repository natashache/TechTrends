const fs = require('fs');
const request = require('request');
const series = require('async-series');
const cheerio = require('cheerio');
const locationData = require('./services/locationData.js');
const promise = require('bluebird');

const fetchJobPostingUrls = function(state) {

  const entry = state.hubs.phoenix.queries.career_builder.web_developer;

  var jobPostingUrls = [];
  
  const parseUrls = function(url) {
    request.get(url, function(err, response, html) {
      if (!err) {
        
        const $ = cheerio.load(html);

        const urls = $('body').find('h2.job-title a'); // TODO: abstract this into source utility
        
        Object.keys(urls).forEach(function(listing) {
          if (urls[listing].attribs !== undefined) {
            var listingUrl = urls[listing].attribs.href;
            listingUrl = 'http://www.careerbuilder.com' + listingUrl.split('?')[0]; // TODO: abstract this into source utility
            jobPostingUrls.push(listingUrl);
          }
        });

        // TODO: recursive logic here to check for additional pages and feed them back into this fetch until all are listed

        fetchAllJobPostingContent(jobPostingUrls, state);
      
      } else {
        console.log(err);
      }
    });
  };

  parseUrls(entry, state);

};

// TODO: this needs to be throttled, ASAP
const fetchAllJobPostingContent = function(urlArr, state) {

  const fetches = urlArr.map(function(url) {
    return function(done) {
      request.get(url, function(error, response, html) {
        if (!error) {
          
          const $ = cheerio.load(html);
          
          const fileName = url.split('\/').pop();
          
          const scrubbedData = $('body').find('.description').text().toLowerCase(); // TODO: abstract this into source utility

          const result = {
            id: fileName,
            date: new Date(),
            country: '000',
            state: state.name,
            hub: 'phoenix',
            source: 'career_builder',
            query: 'web_developer',
            url: url,
            text: scrubbedData
          };

          fs.writeFile((__dirname + '/services/processed_data/' + fileName + '.txt'), JSON.stringify(result), function(err) {
            if (err) console.log(err);
          });

          done();

        }
      });
    };
  });

  series(fetches, function(err) {
    if (err) console.log('failed to download: ', err);
  });

};

fetchJobPostingUrls(locationData['000'].states.arizona);
