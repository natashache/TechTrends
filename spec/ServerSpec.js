//process.env['dev'] = true;

var request = require('supertest');
var app = require('../server.js');
var expect = require('chai').expect;

/////////////////////////////////////////////////////
// NOTE: these tests are designed for mongo!
/////////////////////////////////////////////////////

var mongoose = require("mongoose");

var examplePosting = {
"date": "1000", 
"country": "Europe", 
"state": "Maryland", 
"hub": "la", 
"source": "career_builder", 
"url": "www.fff.com", 
"text": "some posting text"
}; 

describe ('App (using local db)', function() {

  describe('Posting creation: ', function() {

    it('gets postings', function(done) {
      request(app)
        .get('/raw-posting?date=0')
        .send(examplePosting)
        .expect(202)
        .end(done);
    });

    /*it('posts postings', function(done) {
      request(app)
        .post('/raw-posting')
        .send(examplePosting)
        .expect(202)
        .end(done);
    });

    it('deletes postings', function(done) {
      request(app)
        .post('/raw-posting')
        .send(examplePosting)
        .expect(202)
        .end(done);
    });*/

  }); 

});
