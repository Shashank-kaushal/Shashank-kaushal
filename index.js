const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect('mongodb://127.0.0.1:27017/node-project').then(() => {
  console.log("DB connected.");
}).catch((err)=>{
  console.log('error', err)
});

const userSchema = new mongoose.Schema({
  username : {
    type: String,
    required: true
  }
});

const exerciseSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  description:{
    type: String
  },
  duration : {
    type: Number
  },
  date : {
    type: String
  }
});

const logSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  count: {
    type: Number
  },
  log : {
    type: Array
  }
});

const User = mongoose.model('user', userSchema);
const Exercise = mongoose.model('exercise', exerciseSchema);
const Log = mongoose.model('log', logSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.use(bodyParser.urlencoded({extends:true}))
app.post('/api/users', async(req, res) => {
  const username = req.body.username;
  const result = await User.create({
    username : username
  })
  res.status(201).json(result);
})

app.get('/api/users', (req, res) => {
  const result = User.find({});
  res.status(200).json(result);
});

app.post('/api/users/:_id/exercises', async(req, res) => {
  const userid = req.params._id;
  console.log(userid);

  const description = req.body.description;
  const duration = req.body.duration;
  let date = '';
  let userName = '';
  if( req.body.date == null || !req.body.date){
    date = new Date().toDateString();
  }else{
    date = new Date(req.body.date).toDateString();
  }
  
  if( userid == null || !userid || !description || !duration){
    res.status(400).json({"message":"required params missing"});
    return;
  }
  
  let getUsers =  await User.findOne({"_id": userid});
  
  if( !getUsers ){
    res.status(400).json({"message":"username not foudn with the given id."});
    return;
  }
  userName = getUsers.username;
  const result =  await Exercise.create({
    username: userName,
    description: description,
    duration: duration,
    date: date
  });
  res.status(201).json(result);
  
});

app.get('/api/users/:_id/logs', async(req, res) => {
  const user_id = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  if( !user_id ){
    res.status(400).json({"message" : "user id missing"});
    return;
  }
  let getUserDetails = await User.findOne({"_id": user_id});
  if( !getUserDetails ){
    res.status(400).json({"message" : "user details not found with id -" + user_id});
    return;
  }
  let exerResult = [];
  let query = [];
  if( !from || !to || !limit ){
    exerResult = await Exercise.find({"username":getUserDetails.username});
  }else{
    exerResult = await Exercise.find(
      {"username":getUserDetails.username, "date" : {$gte:new Date(from).toDateString(), $lte:new Date(to).toDateString()}}).limit(limit);
  }
  
  let logDetails = [];
  let execsCount = 0;
  exerResult.map((userExercise) => {
    logDetails.push({
      "description" : userExercise.description,
      "duration" : userExercise.duration,
      "date" : userExercise.date
    });
    execsCount++;
  })
  const logs = {
    "username" :getUserDetails.username,
    "count" : execsCount,
    "log" : logDetails
  }
  res.status(200).json(logs);
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
