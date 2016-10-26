const postingsHelpers = require('./databases/postingsHelpers.js');
const analyzedHelpers = require('./databases/analyzedHelpers.js');
const bodyParser = require('body-parser');
const app = require('express')();
const port = 8000;
const mongoose = require('mongoose');
const path = require('path');

//-------------------middlewares-------------------------------
//-------------------------------------------------------------

app.use(bodyParser.json());

app.use((req, res, next) => {
  next();
});
//console.log('debug env',process.env.debug);
//---------------------base route------------------------------
//-------------------------------------------------------------

app.get('/', (req, res) => {
  //console.log('getting index');
  res.status(200).sendFile(path.join(__dirname + '/web/public/index.html'));
});

//----------routes for the raw postings database---------------
//-------------------------------------------------------------

app.get('/raw-postings', (req, res) => {
  if(req.query.index){
    //console.log('req index', req.query.index)
    //console.log('req date', req.query.date)
    postingsHelpers.iterateDatelist(req.query.date, req.query.index,(result)=>{
      //console.log('sending result', result);
      res.status(202).send(JSON.stringify(result));
    });
  } else {
    postingsHelpers.getPostings(req.query.date, (results) => {
      res.status(202).send(results);
    });
  }
});

app.post('/raw-postings', (req, res) => {
  postingsHelpers.addNewPosting(req.body, (newPosting) => {
    res.status(202).send(req.body);  
  });
});

app.delete('/raw-postings', (req, res) => {
  //console.log('receiving delete request');

  const date = req.query.date;
  const hub = req.query.hub;

  //console.log('date',date);
  postingsHelpers.deletePostings(date, hub, (result) => {
    //console.log('delete results',result);
    res.status(204).send(result);
  });
})

//----------routes for the analyzed database-------------------
//-------------------------------------------------------------

app.get("/analyzed-data", (req, res) => {
  let hub = req.query.hub;
  let view = req.query.viewName;

  analyzedHelpers.getAnalytics(hub, view, (viewArray) => {
    //console.log(`found ${view} view data for ${hub}`);
    //console.log("data array", viewArray);

    if(!viewArray) {
      res.status(404).send("data not found");
    } else {
      res.status(200).send(viewArray);
    }
    
  });
});

app.post("/analyzed-data", (req, res) => {
  //console.log('post endpoint');
  analyzedHelpers.addNewAnalytic(req.body, (hubObject) => {
    //console.log("saved hub object", hubObject);
    res.status(201).send(hubObject);
  });
});

app.delete('/analyzed-data/', (req, res) => {
  var hub = req.query.hub;
  analyzedHelpers.deleteAnalyticCollection(hub, (result) => {
    res.status(204).send(result);
  });
})

module.exports = app;
