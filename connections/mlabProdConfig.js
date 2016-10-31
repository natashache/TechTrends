
var app = require('../server.js');
var inquirer = require('inquirer');
process.env.dev = false;
const port = 8000;
const mongoose = require('mongoose');

const POSTINGSURI = process.env.dburl || require('./connections.json').production;
mongoose.connect(POSTINGSURI);
console.log('running production config');
console.log('URI:', POSTINGSURI);

//------------------server listen------------------------------
//-------------------------------------------------------------

app.listen(process.env.PORT || port, () => {
  console.log('web server listening on port', port);
});

module.exports = app; 