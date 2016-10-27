const inquirer = require('inquirer');
const request = require('request');
const async = require('async');
const cheerio = require('cheerio');
const keysMethods = require('./keys.js');
const promise = require('bluebird');

const apiEndpointGetDateIds = 'http://localhost:8000/raw-postings/dates';
const apiEndpointRoot = 'http://localhost:8000/raw-postings/';
const apiEndpointGetNumberOfRecords = 'http://localhost:8000/raw-postings?date=';

const hrSingle = '-----------------------------------------------------------------------------------';
const hrDouble = '===================================================================================';

//================ TEMP ====================
//==========================================

const tempGeo = {
  // countries > states > hubs > sources > queries
  united_states: {
    arizona: {
      phoenix: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-phoenix,az'
        }
      }
    },      
    california: {
      san_jose: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-san-jose,ca'
        }
      },
      san_francisco: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-san-francisco,ca'
        }
      },
      los_angeles: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-los-angeles,ca'
        }
      },
      san_diego: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-san-diego,ca'
        }
      }
    },
    colorado: {
      boulder: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-boulder,co'
        }
      },
      fort_collins: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-fort-collins,co'
        }
      }
    },
    georgia: {
      atlanta: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-atlanta,ga'
        }
      }
    },
    illinois: {
      chicago: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-chicago,il'
        }
      }
    },
    kansas: {
      kansas_city: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-kansas-city,ks'
        }
      }
    },
    massachusetts: {
      boston: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-boston,ma'
        }
      }
    },
    new_mexico: {
      albuquerque: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-albuquerque,nm'
        }
      }
    },
    new_york: {
      new_york: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-new-york,ny'
        }
      }
    },
    north_carolina: {
      raleigh: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-raleigh,nc'
        }
      }
    },
    oregon: {
      portland: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-portland,or'
        }
      }
    },
    pennsylvania: {
      philadelphia: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-philadelphia,pa'
        }
      },
      pittsburg: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-pittsburgh,pa'
        }
      }
    },
    tennessee: {
      memphis: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-memphis,tn'
        }
      },
      nashville: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-nashville,tn'
        }
      }
    },
    texas: {
      austin: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-austin,tx'
        }
      },
      houston: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-houston,tx'
        }
      },
      dallas_fort_worth: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-dallas-fort-worth,tx'
        }
      }
    },
    utah: {
      provo: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-provo,ut'
        }
      },
      salt_lake_city: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-salt-lake-city,ut'
        }
      }
    },
    washington: {
      seattle: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-seattle,wa'
        }
      }
    },
    washington_dc: {
      washington_dc: {
        career_builder: {
          web_developer: 'http://www.careerbuilder.com/jobs-web-developer-in-washington,dc'
        }
      }
    }
  }
};

const tempGetHubs = () => {
  var hubs = {}, geo = tempGeo;

  for (var country in geo) {
    for (var state in geo[country]) {
      for (var hub in geo[country][state]) {
        hubs[hub] = {};
      }
    }
  }

  return hubs;
};

//================ result ==================
//==========================================

// init: define an object to hold the count data for a date to be stored in prod
var crunched = keysMethods.getHubs();

//========= js frameworks crunch ===========
//==========================================
const cruncherJSFrameworks = () => {
  
  // init: store a reference to the view currently being operated on
  const view = 'javascriptFrameworks';

  console.log(hrDouble);
  console.log('[?] beginning crunch of', view);
  console.log(hrDouble);

  // init: add this data storge to results for this view
  for (var hub in crunched) crunched[hub][view] = {};
  
  // init: store a list of all the tech tracked for this view
  const tech = keysMethods.getTech(view);

  request.get(apiEndpointGetDateIds, (err, res, body) => {
    if (err) {
      console.log('[X] error fetching date id\'s');
    } else {
      
      // init: get and store hub listing
      const hubs = keysMethods.getHubs();
      
      // store fetched date id's
      // TODO endpoint for this fetch doesn't work, will have to fix eventually
      var dateIds = JSON.parse(body);
      // const dateIds = keysMethods.getDateIds();
      // filter out any test dates
      dateIds = dateIds.filter((date) => {
        return date > 1000000;
      });
      console.log('[*] dates to be crunched this batch:', dateIds);

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

          console.log(hrSingle);
          console.log('[?] beginning fetch and parse for date id', date);
          console.log(hrSingle);

          // add a count storage bin to each hub for this date
          for (var hub in crunched) {
            crunched[hub][view][date] = Bin();
          }
          
          const recordsCountUrl = apiEndpointGetNumberOfRecords + date + '&index=-1';

          request.get(recordsCountUrl, (err, res, body) => {
            if (err) {
              console.log('[X] error fetching number of records for a date id', err);
            } else {
              
              // request length (number of records) for the current date slice and store it
              const numberOfRecords = body;
              console.log('[*] date id', date, 'has', numberOfRecords, 'records');
              
              if (numberOfRecords > 0) {

                var records = [];

                // for each record in a date, push a request/parse func to a series func
                for (var i = 0; i < 5; i++) {
                  // construct the request url including this index
                  const thisRecordRequestUrl = `${apiEndpointRoot}?date=${date}&index=${i}`;
                  records.push((complete) => {
                    console.log('[?] request record at url: ', thisRecordRequestUrl)
                    // request the specific record for the specific date
                    request
                      .get(thisRecordRequestUrl, (err, res, body) => {
                        if (err) {
                          console.log('[X] error fetching record', err);
                        } else {
                          console.log('[+] record fetched successfully');
                          body = JSON.parse(body);
                          // parse the response text value for tech and increment counters
                          for (var technology in tech) {
                            if (tech[technology].test(body.text)) {
                              console.log('found', technology);
                              crunched[body.hub][view][date][technology]++;
                            }
                          }
                          setTimeout(() => { complete() }, 500);
                        }
                      });
                  });
                }

                async.series(records, (err) => {
                  if (err) {
                    console.log(hrSingle);
                    console.log('[X] error fetching and/or parsing records for date', date, err);
                    console.log(hrSingle);
                  } else {
                    console.log(hrSingle);
                    console.log('[+] records fetched and parsed successfully for date', date);
                    console.log(hrSingle);
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
          console.log(hrDouble);
          console.log('[X] failed JS framework crunch');
          console.log(hrDouble);
        } else {
          console.log(hrDouble);
          console.log('[+] JS framework crunch complete!');
          console.log(hrDouble);
        }
      });
    
    }
  });

  

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

};

cruncherJSFrameworks();
