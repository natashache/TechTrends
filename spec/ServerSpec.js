
var request = require('request');
var rp = require('request-promise');
var server = 'http://127.0.0.1:8000';
var chai = require('chai');
var expect = chai.expect;

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

beforeEach(function(done){
  rp.delete(server+'/raw-postings/:0').then(res=>{
    done();
  });
})

describe ('service of static assets',function(){
  it('serves index',function(done){
    request(server+'/').on('response',function(res){
      expect(res.statusCode).to.equal(200);
      done();
   });
  });
});

describe ('raw-postings api',function(){
  it('shows nothing after deletion',function(done){
    //rp.post(server+'/raw-postings',{json: examplePosting1})
    Promise.all([ rp.delete(server+'/raw-postings/:0'),
                  rp.get(server+'/raw-postings'), 
                  ])
      .then(responses=>{
        console.log('r1',responses);
        expect(JSON.parse(responses[1]).length).to.equal(0);
        done();
    });
  });

  it('posts',function(done){
    Promise.all([rp.post(server+'/raw-postings',{json: examplePosting1}),
                 rp.post(server+'/raw-postings',{json: examplePosting2}),
                 rp.post(server+'/raw-postings',{json: examplePosting3}),])
      .then(responses=>{
        expect(JSON.parse(responses[1]).country).to.equal('A');
        done();
      });
  });

  it('returns the posted object from a post request',function(done){
    rp.post(server+'/raw-postings',{json: examplePosting1})
      .then(response=>{
        console.log('post response',response);
        done();
      });
  });

  it('gets the results of posts',function(done){
    Promise.all([rp.post(server+'/raw-postings',{json: examplePosting1}),
                 rp.post(server+'/raw-postings',{json: examplePosting2}),
                 rp.post(server+'/raw-postings',{json: examplePosting3}),])
      .then(rp.get(server+'/raw-postings?date=0'))
      .then(res=>{
        console.log('results of get', res);
      });
  })

  it('shows nothing after deletion',function(done){
    //rp.post(server+'/raw-postings',{json: examplePosting1})
    Promise.all([ rp.delete(server+'/raw-postings/:0'),
                  rp.get(server+'/raw-postings'), 
                  ])
      .then(responses=>{
        console.log('r1',responses);
        expect(JSON.parse(responses[1]).length).to.equal(0);
        done();
    });
  });
});


// describe ('App (using local db)', function() {

//   describe('Posting creation: ', function(done) {
    
   
  
    // it('deletes postings', function(done) {
    //   request(app)
    //     .delete('/raw-postings/:0')
    //     .then(function(response){
    //       //console.log(response.status);
    //       expect(response.status).to.equal(204);
    //       done();
    //     })
    // });

    // it('posts postings', function(done) {
    //   var posts = [request(app).post('/raw-postings').send(examplePosting1),
    //               request(app).post('/raw-postings').send(examplePosting2),
    //               request(app).post('/raw-postings').send(examplePosting3)];

    //   Promise.all(posts).then(function(...results){
    //     console.log(results);
    //     done();
    //   });
    // });

    //  it('gets postings', function(done) {
    //    request(app)
    //      .get('/raw-postings?date=0')
    //      .then(function(response){
    //      expect(response.status).to.equal(202);
    //       done();
    //      });
    //  });

    //  it('posts', function(done) {
    //   request(app)
    //     .post('/raw-postings')
    //     .send(examplePosting2)
    //     .then(function(response){
    //       expect(response.status).to.equal(202);
    //       expect(response.length).to.equal(1);
    //       done();
    //     });
    //  });

  //}); 

  // it('deletes postings', function(done) {
  //     request(app)
  //       .delete('/raw-postings/:0')
  //       .then(function(response){
  //         console.log(response.status);
  //         expect(response.status).to.equal(204);
  //         done();
  //       })
//    });

// });
