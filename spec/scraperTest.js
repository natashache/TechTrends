
var request = require('request');
var rp = require('request-promise');
var server = 'http://127.0.0.1:8000';
var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');
const async = require('async');

//api methods

var getallDates = function(){return rp.get(server+'/raw-postings/dates');};
var getall = function(){return rp.get(server+'/raw-postings?date=0');};

var scraper = require('../services/scraper.js');
var keysMethods = require('../services/keys.js');

keysMethods.setGeo(keysMethods.singlePage);
scraper.setKeys(keysMethods);
scraper.runAsPromise()
.then(getall)
.then(function(results){
  var res = JSON.parse(results);
  console.log(results);
});


