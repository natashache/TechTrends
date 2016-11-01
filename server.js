const postingsHelpers = require('./databases/postingsHelpers.js');
const analyzedHelpers = require('./databases/analyzedHelpers.js');
const bodyParser = require('body-parser');
var express = require('express');
const app = require('express')();
const port = 8000;
const mongoose = require('mongoose');
const path = require('path');

//-------------------middlewares-------------------------------
//-------------------------------------------------------------

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`${req.method} REQUEST AT ${req.url}`);
  next();
});

app.use(express.static('web'));


//---------------------static routes------------------------------
//-------------------------------------------------------------

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname + '/web/public/index.html'));
});

app.get('/about', (req, res) => {
  res.status(200).sendFile(path.join(__dirname + '/web/public/about.html'));
});

app.get('/css/styles', (req, res) => {
  res.sendFile(path.join(__dirname + '/web/public/css/styles.css'));
});

app.get('/js/vendor', (req, res) => {
  res.sendFile(path.join(__dirname + '/web/public/js/vendor.min.js'));
});

app.get('/js/scripts', (req, res) => {
  res.sendFile(path.join(__dirname + '/web/public/js/scripts.min.js'));
});

//----------routes for the raw postings database---------------
//-------------------------------------------------------------

app.get('/raw-postings', (req, res) => {
  if(req.query.index){
    postingsHelpers.iterateDatelist(req.query.date, req.query.index,(result)=>{
      res.status(202).send(JSON.stringify(result));
    });
  } else {
    postingsHelpers.getPostings(req.query.date, (results) => {
      res.status(202).send(results);
    });
  }
});

app.get('/raw-postings/dates', (req, res) => {
    postingsHelpers.getAllDates(result=>{
      res.status(202).send(JSON.stringify(result));
    });
});

app.post('/raw-postings', (req, res) => {
  postingsHelpers.addNewPosting(req.body, (newPosting) => {
    res.status(202).send(req.body);  
  });
});

app.delete('/raw-postings', (req, res) => {
  const date = Number(req.query.date);
  const hub = req.query.hub;

  postingsHelpers.deletePostings(date, hub, (result) => {
    res.status(204).send(result);
  });
})

//----------routes for the analyzed database-------------------
//-------------------------------------------------------------

app.get("/analyzed-data", (req, res) => {
  let hub = req.query.hub;
  let view = req.query.viewName;

  analyzedHelpers.getAnalytics(hub, view, (viewArray) => {

    if(!viewArray) {
      res.status(404).send("data not found");
    } else {
      res.status(200).send(viewArray);
    }
    
  });
});

app.post("/analyzed-data", (req, res) => {
  console.log("post request");
  
  req.body.forEach((hubObject) => {
    analyzedHelpers.addNewAnalytic(hubObject, (obj) => {
      console.log(`wrote ${obj} to the database`);
    });
  });

  res.status(200).send("OK");
});

//returns a list of the views
app.get("/analyzed-data/views", (req, res) => {
  analyzedHelpers.getViewsList((viewsArray) => {
    res.status(200).send(viewsArray);
  });
});

//returns a list of the hubs
app.get("/analyzed-data/hubs", (req, res) => {
  analyzedHelpers.getHubs((list) => {
    res.status(200).send(list);
  });
});

app.delete('/analyzed-data/', (req, res) => {
  var hub = req.query.hub;
  analyzedHelpers.deleteAnalyticCollection(hub, (result) => {
    res.status(204).send(result);
  });
})

module.exports = app;

