const inquirer = require('inquirer');
const request = require('request');
const async = require('async');
const cheerio = require('cheerio');
const keysMethods = require('./keys.js');
const promise = require('bluebird');

const apiEndpointGetDateIds = 'http://localhost:8000/raw-postings/dates';
const apiEndpointGetNumberOfRecords = 'http://localhost:8000/raw-postings?date=';

//============== utilities =================
//==========================================

parseTechnologies = (str, tech) => {
  Object.keys(technologyPatterns).forEach((technology) => {
    hasTechnologies[technology] = technologyPatterns[technology].test(str);
  });
  return hasTechnologies;
};

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


//========= js frameworks crunch ===========
//==========================================
const cruncherJSFrameworks = () => {
  
  // init: define a records object to hold the data to be stored in prod
  var records = tempGetHubs();
  // var records = keysMethods.getHubs(); // TODO

  // init: store a reference to the view currently being operated on
  const view = 'javascriptFrameworks';

  // init: attach this view to each hub in records
  for (var hub in records) records[hub][view] = [];

  console.log('records: ', records);

  // init: store a list of all the tech tracked for this view
  const tech = keysMethods.getTech(view);  

  request.get(apiEndpointGetDateIds, (err, res, body) => {
    if (err) {
      console.log('[X] error fetching date id\'s');
    } else {
      
      // store fetched date id's
      const dateIds = body;
      console.log('date ids: ', dateIds);

      // map all date id's to fetch functions to store in async
      // TODO break this out into a component function and not in the main body
      const dates = dateIds.map((date) => {
        return (done) => {

          console.log('this date id: ', date);
          
          const recordsCountUrl = apiEndpointGetNumberOfRecords + date + '&index=-1';

          request.get(recordsCountUrl, (err, res, body) => {
            if (err) {
              console.log('[X] error fetching number of records for a date id', err);
            } else {
              
              // request length (number of records) for the current date slice and store it
              const numberOfRecords = body;
              console.log('number of records', numberOfRecords);
              
              if (numberOfRecords > 0) {

                // for each date slice, build a temp storage bin per hub to keep a tech count
                var bins = {};

                // bin storage constructor
                const BinInit = () => {
                  var bin = {};
                  for (var item in tech) {
                    bin[item] = 0;
                  }
                  return bin;
                };

                // initialize data points in each bin
                for (var hub in records) bins[hub] = BinInit();

                console.log(bins);

                // request all records for the current date slice
                // TODO break this out into a component function and not in the main body
                // for (var i = 0; i < numberOfRecords; i++) {
                //   request
                //     // TODO: need the real url to continue
                //     .get('http://localhost:8000/raw-postings?' + dateId) 
                //     .on('error', (err) => {
                //       console.log('[X] error fetching record', err);
                //     })
                //     .on('response', (response) => {
                //       console.log('[ ] record fetched successfully');
                //       parseTechnologies(JSON.stringify(response, tech));
                //       // parse the response for keywords, increment count if found
                //     });
                // }

              }
            }
          });
        };
      });
      
      async.series(dates, (err) => {
        if (err) console.log('[X] failed JS framework crunch');
      });
    
    }
  });

  

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
  // colorado: {...}

};

cruncherJSFrameworks();
