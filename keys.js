var keys = {};

keys.collections = {};

keys.methods = {};

// ===== connection string =====

keys.collections.connectionString = 'mongodb://hera:8292fwiw@ds063406.mlab.com:63406/rawpostings';
keys.collections.testdbConnectionString = 'mongodb://hera:8292fwiw@ds063406.mlab.com:63406/rawpostings-test';

keys.methods.getConnectionString = () => {
  return keys.collections.connectionString;
};

// =========== geo =============

keys.collections.geo = {
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

keys.methods.getQueries = () => {
  var queries = [], geo = keys.collections.geo;

  // const now = new Date().getTime();
  const now = 1477411263456; // hard code this for now at 9:00AM every morning until scrape can be done in one batch
  
  for (var country in geo) {
    for (var state in geo[country]) {
      for (var hub in geo[country][state]) {
        for (var source in geo[country][state][hub]) {
          for (var query in geo[country][state][hub][source]) {
            
            queries.push({
              date: now,
              country: country,
              state: state,
              hub: hub,
              source: source,
              term: query,
              start: geo[country][state][hub][source][query] 
            });
          
          }
        }
      }
    }
  }
  
  return queries;
};

keys.methods.getHubs = () => {
  var hubs = {}, geo = keys.collections.geo;

  for (var country in geo) {
    for (var state in geo[country]) {
      for (var hub in geo[country][state]) {
        hubs[hub] = {};
      }
    }
  }

  return hubs;
};

// ========= sources ===========

keys.collections.sources = {
  career_builder: {
    urlRoot: 'http://www.careerbuilder.com',
    urlPage: '?page_number=',
    elemRecordLink: 'h2.job-title a',
    elemRecordBody: '.description'
  }
};

keys.methods.getSource = (source) => {
  return keys.collections.sources[source];
};

// =========== tech ============

keys.collections.tech = {
  'javascriptFrameworks': {
    angular: /angular/im,
    backbone: /backbone/im,
    react: /react/im,
    ember: /ember/im,
    knockout: /knockout/im,
    aurelia: /aurelia/im,
    meteor: /meteor/im,
    polymer: /polymer/im,
    vue: /vue/im,
    mercury: /mercury/im
  },
  // // browser
  // 'html': /html/im,
  // 'css': /html/im,
  // // js
  // 'js': /javascript/im,
  // 'jquery': /jquery/im,
  // // ms
  // '.net': /.net/im,
  // 'c#': /c\#/im,
  // 'c++': /c\+\+/im,
  // 'vb': /vb/im,
  // 'visual basic': /visual basic/im,
  // // java
  // 'java': /java/im,
  // 'jvm': /jvm/im,
  // // php
  // 'php': /php/im,
  // 'laravel': /laravel/im,
  // // cms
  // 'wordpress': /wordpress/im,
  // // architecture
  // 'mvc': /mvc/im,
  // 'rest': /rest/im,
  // 'restful': /restful/im,
  // // db's
  // 'sql': /sql/im,
  // 'mysql': /mysql/im,
  // 'mongo': /mongo/im, // this needs more added
  // 'neo4j': /neo4j/im,
  // 'postgres': /postgres/im,
  // // management
  // 'agile': /agile/im,
  // 'scrum': /scrum/im,
};

keys.methods.getTech = (view) => {
  return keys.collections.tech[view];
};

module.exports = keys.methods;
