const express = require('express'), //the framework of node.js, use to simplify the syntax of node javascript code.
  fs = require('fs'), //filesystem
  path = require('path'), //another built-in module
  bodyParser = require('body-parser'), //The body-parser middleware module allows you to read the “body” of HTTP requests within your request handlers simply by using the code req.body.
  uuid = require('uuid'); //generate a random id

const morgan = require('morgan'); // a middleware for logging the request url to the terminal.
const app = express(); // an instance of express
const mongoose = require('mongoose'); //mongoose is used to configure the model and schema of mongodb database. Give it a standard format.
const model = require('./model.js'); //mongoose models store in a separate file, usually called model.js

const movies = model.Movie; //extract Movies from model.js
const users = model.User; //extract Users from model.js

// mongoose.connect('mongodb://localhost:27017/myFlixDB', (err) => {
//   if (err) throw err;
//   console.log('Connected to MongoDB!!!');
// });

mongoose.connect(process.env.CONNECTION_URI, (err) => {
  if (err) throw err;
  console.log('Connected to MongoDB!!!');
}); //This allows Mongoose to connect to that database so it can perform CRUD operations on the documents it contains from within your REST API, also connect mongo db atlas database with the Heroku API

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

// setup the logger by combining morgan common format data with the log.txt created above.
app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.json()); //with this line of code, every time req.body will be in Json format, in other word it will translate all data in req.body to json format, so that can be push/add/update into the database through API.
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors'); //What CORS does is extend HTTP requests, decide which domain is allow or disallowed
const { check, validationResult } = require('express-validator');

app.use(cors());

let auth = require('./auth')(app); // this lind of code is to ensure the application can use auth.js and auth.js can also use Express.
const passport = require('passport');
require('./passport');

app.get('/', (req, res) => {
  res.send('Welcome to MyFlix!');
});

//get all movies
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    movies
      .find() //find() here is one of mongoose query functions.Instead of query from the actual database, it queries from the mongoose model.
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error:' + err);
      });
  }
);

//get movies/movie by its movie title
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    movies
      .find({ Title: req.params.title }) //find() here is one of mongoose query functions.Instead of query from the actual database, it queries from the mongoose model.
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send('Error:' + err);
      });
  }
);

//get genres by genre name
app.get(
  '/movies/genres/:name',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    movies
      .findOne({ 'Genre.Name': req.params.name }) //findOne() here is one of mongoose query functions.Instead of query from the actual database, it queries from the mongoose model.
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send('Error:' + err);
      });
  }
);

//get directors by director name
app.get(
  '/movies/directors/:directorname',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    movies
      .findOne({ 'Director.Name': req.params.directorname }) //findOne() here is one of mongoose query functions.Instead of query from the actual database, it queries from the mongoose
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send('Error:' + err);
      });
  }
);
//update a user's info, by username
// we'll expect JSON in this format
// {
//   Username:String,(require)
//   Password:String,(require)
//   Email:String,(require)
//   Birthday:Date
// }
app.put(
  '/users/:Username',
  //Validatin logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min:5}) which means
  //mininum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
  ],
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashPassword =
      req.body.Password.length < 50
        ? users.hashPassword(req.body.Password)
        : req.body.Password;

    users.findOneAndUpdate(
      //findOneAndUpdate() here is one of mongoose query functions.Instead of query from the actual database, it queries from the mongoose
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashPassword,
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
  }
);

//Get all users
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    users
      .find() //find() here is one of mongoose query functions.Instead of query from the actual database, it queries from the mongoose
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error:' + err);
      });
  }
);

//Get a user by username
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    users
      .findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error:' + err);
      });
  }
);

//Add a user
// we'll expect JSON in this format
// {
//   ID:Integer,
//   Username:String,
//   Password:String,
//   Email:String,
//   Birthday:Date

// }
app.post(
  '/users',
  //Validatin logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min:5}) which means
  //mininum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    // check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    //check the validation object for errors
    console.log(req.body);
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashPassword = users.hashPassword(req.body.Password);
    users
      .findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //if the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          users
            .create({
              Username: req.body.Username,
              Password: hashPassword,
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
  }
);

//Delete/Deregister a user by username
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
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
  }
);

//Add a movie to a user's list of favorites
app.post(
  '/users/:username/collections/:ID',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $push: { FavoriteMovies: req.params.ID },
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
  }
);
//Add an item to a user's wishlist
app.post(
  '/users/:username/wishlist/:ID',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $push: { Wishlist: req.params.ID },
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
  }
);

//Remove an item from user's wishlist
app.delete(
  '/users/:username/wishlist/:ID',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $pull: { Wishlist: req.params.ID },
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
  }
);
//Remove a movie from user's list of favorites
app.delete(
  '/users/:username/collections/:ID',
  passport.authenticate('jwt', { session: false }), //Authenticate on/off
  (req, res) => {
    users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $pull: { FavoriteMovies: req.params.ID, Wishlist: req.params.ID },
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
  }
);

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.use(express.static('public')); //This function automatically routes all requests for static files to their corresponding files within a certain folder on the server (in this case, the “public” folder). With this function in place, if someone were to request, for instance, the “index.html” file, Express would automatically route that request to send back a response with the “public/index.html” file.

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port' + port);
});
