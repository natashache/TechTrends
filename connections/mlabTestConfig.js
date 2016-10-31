<<<<<<< 374f86d92e8e6c1bb738d8fda0dd76d95e98a482
var app = require('../server.js');
var inquirer = require('inquirer');
process.env.dev = false;
const port = 8000;
const mongoose = require('mongoose');

const POSTINGSURI = process.env.dburl || require('./connections').test;
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

=======
var app = require('../server.js');
var inquirer = require('inquirer');
process.env.dev = false;
const port = 8000;
const mongoose = require('mongoose');

const POSTINGSURI = process.env.dburl || require('./connections').test;
mongoose.connect(POSTINGSURI);
console.log('URI:', POSTINGSURI);

app.listen(process.env.PORT || port, () => {
  console.log('web server listening on port', port);
});

>>>>>>> production config env.dburl
module.exports = app; 