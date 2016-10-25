var app = require('server.js');

const port = 8000;
const mongoose = require('mongoose');

const POSTINGSURI = "mongodb://hera:hackreactor19@ds063406.mlab.com:63406/rawpostingsx";

console.log('URI:', POSTINGSURI);
mongoose.connect(POSTINGSURI);

//------------------server listen------------------------------
//-------------------------------------------------------------

app.listen(process.env.PORT || port, () => {
  console.log('web server listening on port', port);
});