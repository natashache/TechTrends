
var request = require('request');
var rp = require('request-promise');
var server = 'http://127.0.0.1:8000';
var chai = require('chai');
var mocha = require('mocha');
var expect = chai.expect;
var Promise = require('bluebird');
const async = require('async');

//api methods
var now = 1477411263456;
var getall = function(){return rp.get(server+'/raw-postings?date=0');};
var getlength = function(){return rp.get(server+'/raw-postings?date=1477411263456&index=-1');};
var deleteall = function(){return rp.delete(server+'/raw-postings/?date=0');};

var scraper = require('../services/scraper.js');
var keysMethods = require('../services/keys.js');

describe('scraper',function(){
  this.timeout(5*60*1000);
  beforeEach(function(done){
    deleteall()
    .then(done);
  });

  it('returns something',function(done){
    keysMethods.setGeo(keysMethods.singlePage);
    scraper.setKeys(keysMethods);
    scraper.runAsPromise()
    .then(getlength)
    .then(function(results){
      var res = JSON.parse(results);
      console.log(res);
      expect(res).to.equal(5);
      done();
    })
    .catch(done);
   });

});



