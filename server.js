const postingsHelpers = require('./databases/postingsHelpers.js');
const bodyParser = require('body-parser');
const app = require('express')();
const port = 8000;
const mongoose = require('mongoose');
const path = require('path');

//mongoose is connected anywhere, it's connection is referenced whenever it is required

const POSTINGSURI = process.env['dev']? 
  "mongodb://localhost/postings" : 
  "mongodb://hera:hackreactor19@ds063406.mlab.com:63406/rawpostings";

console.log('URI=========',POSTINGSURI);
mongoose.connect(POSTINGSURI);

console.log(process.env);

//-------------------middlewares-------------------------------
//-------------------------------------------------------------

app.use(bodyParser.json());

//---------------------base route------------------------------
//-------------------------------------------------------------

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname + '/web/public/index.html'));
});

//----------routes for the raw postings database---------------
//-------------------------------------------------------------

app.get('/raw-postings', (req, res) => {
  postingsHelpers.getPostings(req.query.date, (results) => {
    res.status(202).send(results);
  });
});

app.post('/raw-postings', (req, res) => {
  postingsHelpers.addNewPosting(req.body, (newPosting) => {
    console.log("added new posting", newPosting);
    res.status(202).send(newPosting);
  });
});

app.delete('/raw-postings', (req, res) => {
  postingsHelpers.deletePostings(req.query.date, (result) => {
    console.log('callback called');
    res.status(204).send(result);
  });
})

//----------routes for the analyzed database-------------------
//-------------------------------------------------------------

//------------------server listen------------------------------
//-------------------------------------------------------------
app.listen(process.env.PORT || port, () => {
  console.log('web server listening on port', port);
});

module.exports = app;
