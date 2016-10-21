const postingsHelpers = require('./databases/postingsHelpers.js');
const bodyParser = require('body-parser');
var app = require('express')();
var mongoose = require('mongoose');
const path = require('path');

//mongoose is connected anywhere, it's connection is referenced whenever it is required


const POSTINGSURI = process.env['dev']? 
      "mongodb://localhost/postings" : 
      "mongodb://hera:hackreactor19@ds063406.mlab.com:63406/rawpostings";

console.log('URI=========',POSTINGSURI);
mongoose.connect(POSTINGSURI);

console.log(process.env);
//middleware
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.status(200).sendFile(path.join(__dirname + '/web/public/index.html'));
});

//----------routes for the raw postings database---------------
//-------------------------------------------------------------

app.post('/raw-postings',function(req,res){
  postingsHelpers.addNewPosting(req.body, (newPosting) => {
    console.log("added new posting", newPosting);
    res.status(202).send(newPosting);
  });
});


app.get('/raw-postings',function(req,res){
  postingsHelpers.getPostings(req.query.date, function(results){
    res.status(202).send(results);
  });
});

app.delete('/raw-postings',function(req,res){
  postingsHelpers.deletePostings(req.query.date, function(result){
    console.log('callback called');
    res.status(204).send(result);
  });
  
})

//----------routes for the analyzed database-------------------
//-------------------------------------------------------------


//--end routes--
//server listen
app.listen(process.env.PORT || 8000);

module.exports = app; 