
var request = require('request');
var rp = require('request-promise');
var server = 'http://127.0.0.1:8000';
var chai = require('chai');
var mocha = require('mocha');
var expect = chai.expect;
var Promise = require('bluebird');
const async = require('async');
var check = require('check-types');

//api methods
var now = 1477411263456;
var getall = function(){return rp.get(server+'/raw-postings?date=1477411263456');};
var postingType = {
      text: check.string,
      url: check.string,
      term: check.string,
      source: check.string,
      hub: check.string,
      state: check.string,
      country: check.string,
      date: check.number,
    }; 

var getlength = function(){return rp.get(server+'/raw-postings?date=1477411263456&index=-1');};
var deleteall = function(){return rp.delete(server+'/raw-postings/?date=0');};

var scraper = require('../services/scraper.js');
var keysMethods = require('../services/keys.js');

if(!process.env.debug){
  var target = process.env.target;
  var app = require(target);
} 

describe('scraper',function(){
    
    this.timeout(5*60*1000);

    before(function(done){
      keysMethods.setGeo(keysMethods.singlePage);
      scraper.setKeys(keysMethods);

      deleteall()
      .then(scraper.runAsPromise)
      .then(done);
    });

    it('saves the right number of postings',function(done){
      getlength()
      .then(function(results){
        var res = JSON.parse(results);
        console.log(res);
        expect(res).to.equal(4);        
      })
      .then(done)
      .catch(done);
    });

    it('saves :postingType',function(done){
      getall()
      .then(function(results){
        var res = JSON.parse(results);
        console.log(res[0].postings[0]);
        expect(check.all(check.map(res[0].postings[0],postingType))).to.equal(true);       
      })
      .then(done)
      .catch(done);
    });
  
});




