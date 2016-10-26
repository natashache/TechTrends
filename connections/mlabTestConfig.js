var app = require('../server.js');
var inquirer = require('inquirer');
process.env.dev = false;
const port = 8000;
const mongoose = require('mongoose');

const POSTINGSURI = require('./connections').test;
mongoose.connect(POSTINGSURI);
console.log('URI:', POSTINGSURI);

//var rp = require('request-promise');

//var deleteall = function(){return rp.delete('http://localhost:8000'+'/raw-postings/?date=0');};
//deleteall();
//------------------server listen------------------------------
//-------------------------------------------------------------

app.listen(process.env.PORT || port, () => {
  console.log('web server listening on port', port);
});

module.exports = app; 