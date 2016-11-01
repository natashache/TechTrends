var keys = {};

keys.collections = {};

keys.methods = {};

// =========== geo =============

keys.collections.geo = {
  // countries > states > hubs > sources > queries
  united_states: {
    arizona: {
      phoenix: {
        source: {
          query: 'http://www.example.com/query'
        }
      }
    }
  }
};

keys.methods.getQueries = () => {
  var queries = [], geo = keys.collections.geo;

  const now = new Date().getTime();
  
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
  source: {
    urlRoot: 'http://www.example.com',
    urlPage: '',
    elemRecordLink: '',
    elemRecordBody: ''
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
    ember: / ember/im,
    knockout: /knockout/im,
    aurelia: /aurelia/im,
    meteor: /meteor/im,
    polymer: /polymer/im,
    vue: /vue/im,
    mercury: /mercury/im
  }
};

keys.methods.getTech = () => {
  return keys.collections.tech;
};

module.exports = keys.methods;
