const express = require('express'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const model = require('./model.js');

const movies = model.Movie;
const users = model.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', (err) => {
  if (err) throw err;
  console.log('Connected to MongoDB!!!');
});

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to MyFlix!');
});

//get all movies
app.get('/movies', (req, res) => {
  movies
    .find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//get movies/movie by its movie title
app.get('/movies/:title', (req, res) => {
  movies
    .find({ Title: req.params.title })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error:' + err);
    });
});

//get genres by genre name
app.get('/movies/genres/:name', (req, res) => {
  movies
    .findOne({ 'Genre.Name': req.params.name })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error:' + err);
    });
});

//get directors by director name
app.get('/movies/directors/:directorname', (req, res) => {
  movies
    .findOne({ 'Director.Name': req.params.directorname })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error:' + err);
    });
});
//update a user's info, by username
// we'll expect JSON in this format
// {
//   Username:String,(require)
//   Password:String,(require)
//   Email:String,(require)
//   Birthday:Date
// }
app.put('/users/:Username', (req, res) => {
  users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }, //This line makes sure that the updated document is returned
    (err, updateUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error:' + err);
      } else {
        res.json(updateUser);
      }
    }
  );
});

//Get all users
app.get('/users', (req, res) => {
  users
    .find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//Get a user by username
app.get('/users/:Username', (req, res) => {
  users
    .findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//Add a user
// we'll expect JSON in this format
// {
//   ID:Integer,
//   Username:String,
//   Password:String,
//   Email:String,
//   Birthday:Date

// }
app.post('/users', (req, res) => {
  users
    .findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error:' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error:' + error);
    });
});

//Delete/Deregister a user by username
app.delete('/users/:Username', (req, res) => {
  users
    .findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//Add a movie to a user's list of favorites
app.post('/users/:username/collections/:MovieID', (req, res) => {
  users.findOneAndUpdate(
    { Username: req.params.username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }, //This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error:' + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//Remove a movie from user's list of favorites
app.delete('/users/:username/collections/:MovieID', (req, res) => {
  users.findOneAndUpdate(
    { Username: req.params.username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }, //This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error:' + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
