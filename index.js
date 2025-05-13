// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get('/api', (req, res) => {
  var timestamp = new Date();
  res.json({"unix":timestamp.getTime(), "utc" : timestamp.toUTCString()})
})

app.get('/api/:date', (req,res) => {
  var date = req.params.date;
  var timestampRequest = Number(date);
  if(!isNaN(timestampRequest)){
    timestamp = new Date(timestampRequest);
    res.json({"unix":timestampRequest, "utc": timestamp.toUTCString()});
  }else{
    timestamp = new Date(date);
    if( timestamp == 'Invalid Date'){
      res.json({"error":"Invalid Date"});
    }else{
      res.json({"unix":timestamp.getTime(), "utc": timestamp.toUTCString()});
    }
  }
});




// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
