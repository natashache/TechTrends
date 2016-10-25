
var request = require('request');
var rp = require('request-promise');
var server = 'http://127.0.0.1:8000';
var chai = require('chai');
var expect = chai.expect;
var promise = require('bluebird');
var bodyparser = require('body-parser');

var examplePosting1 = {
  "date": "1000", 
  "country": "A", 
  "state": "Maryland", 
  "hub": "la", 
  "source": "career_builder", 
  "url": "www.fff.com", 
  "text": "some posting text"
  }; 

var examplePosting2 = {
  "date": "1000", 
  "country": "B", 
  "state": "Maryland", 
  "hub": "la", 
  "source": "career_builder", 
  "url": "www.fff.com", 
  "text": "some posting text"
  }; 

var examplePosting3 = {
  "date": "1000", 
  "country": "C", 
  "state": "Maryland", 
  "hub": "la", 
  "source": "career_builder", 
  "url": "www.fff.com", 
  "text": "some posting text"
  };

var examplePosting4 = {
  "date": "1001", 
  "country": "D", 
  "state": "Maryland", 
  "hub": "la", 
  "source": "career_builder", 
  "url": "www.fff.com", 
  "text": "some posting text"
  }; 


var postone = function(){
  return rp.post(server+'/raw-postings',{json: examplePosting1});
}

var posttwo= function(){
  return rp.post(server+'/raw-postings',{json: examplePosting2});
}

var postfour = function(){
  return rp.post(server+'/raw-postings',{json: examplePosting4});
}

var postthree =  function(){
    return promise.all([rp.post(server+'/raw-postings',{json: examplePosting1}),
                        rp.post(server+'/raw-postings',{json: examplePosting2}),
                        rp.post(server+'/raw-postings',{json: examplePosting3}),]);
  };

var deleteall = function(){return rp.delete(server+'/raw-postings/:0');};
var deleteone = function(){return rp.delete(server+'/raw-postings/:1001');};

var getall = function(){return rp.get(server+'/raw-postings?date=0');};
var getone = function(){return rp.get(server+'/raw-postings?date=1001');};

beforeEach(function(done){
  deleteall().then(res=>{
    done();
  });
})

describe ('service of static assets',function(){
  it('serves index',function(done){
    request(server+'/').on('response',function(res){
      expect(res.statusCode).to.equal(200);
      done();
    })
  });
});

describe('raw-postings post request',function(){
  it('posts with statusCode of 202',function(done){
      postone()
        .on('response',response=>{
          expect(response.statusCode).to.equal(202);
          done();
        });
    });
    
  it('returns the posted object from a post request',function(done){
      postone()
        .then(response=>{
          expect(response.country).to.equal('A');
        })
        .catch()
        .then(done);
    });

});

describe('raw-postings get request',function(){

  it('gets postings with statusCode of 202',function(done){
    getall()
      .on('response',response=>{
        expect(response.statusCode).to.equal(202);
        done();
      });
  });

  it('getall returns an array of collections',function(done){
    postone()
      .then(getall)
      .then(response=>{
        var res = JSON.parse(response);
        expect(Array.isArray(res)).to.equal(true);
      })
      .then(done)
      .catch(done)
  });

  it('getone returns an array of one collection',function(done){
    postfour()
      .then(getone)
      .then(response=>{
        var res = JSON.parse(response);
        expect(Array.isArray(res)).to.equal(true);
      })
      .then(done)
      .catch(done)
  });

  it('gets one collection by date',function(done){
    postone()
      .then(posttwo)
      .then(postfour)
      .then(getone)
      .then((response)=>{
        var res = JSON.parse(response);
        expect(res.length).to.equal(1);
        expect(res[0].postings.length).to.equal(1);
      })
      .finally(done);
  })

  it('returns all collections on a getall request',function(done){
    postone()
      .then(getall)
      .then(response=>{
        var res = JSON.parse(response);
        expect(res[0].postings[0].country).to.equal('A');
        
      })
      .then(done)
      .catch(done)
  });

});

describe('raw-postings delete request',function(){
  
  it('deletes postings with statusCode of 204',function(done){
    deleteall()
      .on('response',response=>{
        expect(response.statusCode).to.equal(204);
        done();
      });
  });

  it('deletes one datelist by date',function(done){
    postone()
      .then(posttwo)
      .then(postfour)
      .then(deleteone)
      .then(getall)
      .then((response)=>{
        var res = JSON.parse(response);
        expect(res.length).to.equal(1);
        expect(res[0].postings[0].country).to.equal('A');
      })
      .finally(done);
  });

  it('deletes all posts',function(done){
    postone()
      .then(posttwo)
      .then(deleteall)
      .then(getall)
      .then((response)=>{
        expect(JSON.parse(response).length).to.equal(0);
      })
      .finally(done);
  });

});

describe('raw-postings database behavior',function(){

  it('adds multiple posts of the same date to the same list of postings',function(done){
    postone()
      .then(posttwo)
      .then(getall)
      .then((response)=>{
        expect(JSON.parse(response).length).to.equal(1);
        var res = JSON.parse(response);
        expect(res[0].postings.length).to.equal(2);
      })
      .finally(done);
  });

  it('adds multiple posts of a different date to different lists of postings',function(done){
    postone()
      .then(posttwo)
      .then(postfour)
      .then(getall)
      .then((response)=>{
        var res = JSON.parse(response);
        expect(res.length).to.equal(2);
        expect(res[0].postings.length).to.equal(2);
        expect(res[1].postings.length).to.equal(1);
      })
      .finally(done);
  });

});

  



