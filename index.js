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
    required: true,
    unique: true
  }
});

const exerciseSchema = new mongoose.Schema({
  userId:{
    type : String
  },
  username:{
    type: String,
  },
  description:{
    type: String,
    require: true
  },
  duration : {
    type: Number,
    require: true
  },
  date : {
    type: Date
  }
});


const User = mongoose.model('user', userSchema);
const Exercise = mongoose.model('exercise', exerciseSchema);


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.use(bodyParser.urlencoded({extended:false}))

app.post('/api/users', async(req, res) => {
  const username = req.body.username;
  let existsUser = await User.findOne({"username":username});
  let user = {};
  if( !existsUser ){
    const result = await User.create({
      username : username
    }); 
    user = {
      username: result.username,
      _id: result._id
    };
  }else{
    user = {
      username: existsUser.username,
      _id: existsUser._id
    };
  }
  res.status(200).json(user);
})

app.get('/api/users', async(req, res) => {
  const result = await User.find({});
  res.status(200).json(result);
});

app.post('/api/users/:_id/exercises', async(req, res) => {
  const userid = req.params._id;
  const description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  let userName = '';
  
  
  if( !userid || !description || !duration){
    res.status(400).json({"message":"required params missing"});
    return;
  }
  
  let getUsers =  await User.findById(userid);
  
  if( !getUsers ){
    res.status(400).json({"message":"username not found with the given id."});
    return;
  }
  userName = getUsers.username;
  // console.log('existing users -->',getUsers.username);

  const result =  await Exercise.create({
    userId: userid,
    username: userName,
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  });
  
  const exercideDetails = {
    "username" : userName,
    "description": description,
    "duration": parseInt(duration),
    "date": new Date(result.date).toDateString(),
    "_id" : userid,
  };
  res.status(200).json(exercideDetails);
  
});

app.get('/api/users/:_id/logs', async(req, res) => {
  const userid = req.params._id;
const { from, to, limit } = req.query;

if (!userid) {
  return res.json({ message: "user id not found" });
}

const existsuser = await User.findById(userid);
if (!existsuser) {
  return res.json({ message: "user not found." });
}

let dateFilter = {};
if (from) {
  dateFilter["$gte"] = new Date(from);
}
if (to) {
  dateFilter["$lte"] = new Date(to);
}

let filter = { userId: userid }; // make sure this field name is correct in your schema
if (from || to) {
  filter.date = dateFilter;
}

let exercise = await Exercise.find(filter).sort({ date: 1 });

if (limit) {
  exercise = exercise.slice(0, parseInt(limit));
}

const logs = exercise.map(e => ({
  description: e.description,
  duration: parseInt(e.duration),
  date: new Date(e.date).toDateString()
}));

res.json({
  username: existsuser.username,
  _id: userid,
  count: logs.length,
  log: logs
});

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
