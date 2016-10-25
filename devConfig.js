process.env.debug = true;
var app = require('./server.js');

const port = 8000;
const mongoose = require('mongoose');

const POSTINGSURI = "mongodb://localhost/postings";
console.log('URI:', POSTINGSURI);

mongoose.connect(POSTINGSURI);

//------------------server listen------------------------------
//-------------------------------------------------------------

app.listen(process.env.PORT || port, () => {
  console.log('web server listening on port', port);
});

module.exports = app; 