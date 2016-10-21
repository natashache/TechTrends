const POSTINGSURI = 'mongodb://hera:hackreactor19@ds063406.mlab.com:63406/rawpostings'//"mongodb://localhost/postings";
const postingsHelpers = require('./postingsHelpers.js');
const bodyParser = require('body-parser');
var app = require('express')();
var mongoose = require("mongoose");

//mongoose is connected anywhere, it's connection is referenced whenever it is required
mongoose.connect(POSTINGSURI);


//middleware
app.use(bodyParser.json());


//----------routes for the raw postings database---------------
//-------------------------------------------------------------

app.post('/raw-postings',function(req,res){
  postingsHelpers.addNewPosting(req.body, (newPosting) => {
    console.log("added new posting", newPosting);
    res.status(301).send(newPosting);
  });

});


app.get('/raw-postings',function(req,res){
  postingsHelpers.getPostings(req.query.date, function(results){
    res.status(200).send(results);
  });
});

//----------routes for the analyzed database-------------------
//-------------------------------------------------------------


//--end routes--
//server listen
app.listen(process.env.PORT || 8000);