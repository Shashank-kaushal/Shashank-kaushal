require('dotenv').config();
const dns = require('dns');
const { URL } = require('url');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({extended:true}));
var urldata = {};
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const urlObj = new URL(normalized);
  dns.lookup(urlObj.hostname, (err, addr, fml) => {
    if(err){
      res.json({"error":"Invalid Url"});
    }else{
      const shorterUrl = Math.floor(Math.random()*10);
      urldata = {"original_url":normalized, "short_url":shorterUrl}
      res.json(urldata);
    }
  })
});

app.get('/api/shorturl/:id', (req, res) => {
  return res.redirect(urldata.original_url);
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
