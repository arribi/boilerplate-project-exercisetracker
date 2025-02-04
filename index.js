const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Exercise = require('./models/Exercise');

// Connect to the database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));


// Create a new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  try {
    const user = new User({ username });
    const data = await user.save();
    res.json({ _id: data._id, username: data.username });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id username').exec();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Create a new exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;
  const userId = new mongoose.Types.ObjectId(_id);
  const user = await User.findById(userId);
  if (!user) {
    res.status(400).send('Unknown userId');
    return;
  }
  const exercise = new Exercise({
    userId,
    description,
    duration,
    date: date ? new Date(date) : new Date(),
  });
  try {
    const data = await exercise.save();
    res.json({
      _id: user._id,
      username: user.username,
      date: data.date.toDateString(),
      duration: data.duration,
      description: data.description,
    })
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// A GET request to /api/users/:_id/logs will return the user object
// with a log array of all the exercises added.
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const userId = new mongoose.Types.ObjectId(_id);
  const user = await User.findById(userId);
  if (!user) {
    res.status(400).send('Unknown userId');
    return;
  }
  const query = { userId };
  if (from || to) {
    query.date = {};
    if (from) {
      query.date.$gte = new Date(from);
    }
    if (to) {
      query.date.$lte = new Date(to);
    }
  }
  console.log(query);
  try {
    let exercisesQuery = Exercise.find(query);

    if (limit) {
      exercisesQuery = exercisesQuery.limit(parseInt(limit));
    }

    const exercises = await exercisesQuery.exec();

    const log = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }));
    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
