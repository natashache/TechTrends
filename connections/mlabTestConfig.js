
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

module.exports = app; 