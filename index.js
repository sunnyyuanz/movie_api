const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.json());

let collections = [];
let users = [];
let movies = [
  {
    id: 1,
    title: "Harry Potter and the Sorcerer's Stone",
    Description:
      "Harry Potter and the Philosopher's Stone (released in the United States, India and the Philippines as Harry Potter and the Sorcerer's Stone) is a 2001 fantasy film directed by Chris Columbus and distributed by Warner Bros. Pictures, based on J. K. Rowling's 1997 novel of the same name. Produced by David Heyman and screenplay by Steve Kloves, it is the first instalment of the Harry Potter film series. The film stars Daniel Radcliffe as Harry Potter, with Rupert Grint as Ron Weasley, and Emma Watson as Hermione Granger. Its story follows Harry's first year at Hogwarts School of Witchcraft and Wizardry as he discovers that he is a famous wizard and begins his formal wizarding education.",
    genre: "fantasy, Adventure, Children's film, Narrative",
    director: 'Chris Columbus',
    imageurl: '',
  },
  {
    id: 2,
    title: 'Harry Potter and the Chamber of Secrets',
    Description:
      "Harry Potter and the Philosopher's Stone (released in the United States, India and the Philippines as Harry Potter and the Sorcerer's Stone) is a 2001 fantasy film directed by Chris Columbus and distributed by Warner Bros. Pictures, based on J. K. Rowling's 1997 novel of the same name. Produced by David Heyman and screenplay by Steve Kloves, it is the first instalment of the Harry Potter film series. The film stars Daniel Radcliffe as Harry Potter, with Rupert Grint as Ron Weasley, and Emma Watson as Hermione Granger. Its story follows Harry's first year at Hogwarts School of Witchcraft and Wizardry as he discovers that he is a famous wizard and begins his formal wizarding education.",
    genre: "fantasy, Adventure, Children's film, Narrative",
    director: 'Chris Columbus',
    imageurl: '',
  },
  {
    id: 3,
    title: 'Harry Potter and the Prisoner of Azkaban',
    Description:
      "Harry Potter and the Philosopher's Stone (released in the United States, India and the Philippines as Harry Potter and the Sorcerer's Stone) is a 2001 fantasy film directed by Chris Columbus and distributed by Warner Bros. Pictures, based on J. K. Rowling's 1997 novel of the same name. Produced by David Heyman and screenplay by Steve Kloves, it is the first instalment of the Harry Potter film series. The film stars Daniel Radcliffe as Harry Potter, with Rupert Grint as Ron Weasley, and Emma Watson as Hermione Granger. Its story follows Harry's first year at Hogwarts School of Witchcraft and Wizardry as he discovers that he is a famous wizard and begins his formal wizarding education.",
    genre: "fantasy, Adventure, Children's film, Narrative",
    director: 'Chris Columbus',
    imageurl: '',
  },
  {
    id: 4,
    title: 'Harry Potter and the Goblet of Fire',
    Description:
      "Harry Potter and the Philosopher's Stone (released in the United States, India and the Philippines as Harry Potter and the Sorcerer's Stone) is a 2001 fantasy film directed by Chris Columbus and distributed by Warner Bros. Pictures, based on J. K. Rowling's 1997 novel of the same name. Produced by David Heyman and screenplay by Steve Kloves, it is the first instalment of the Harry Potter film series. The film stars Daniel Radcliffe as Harry Potter, with Rupert Grint as Ron Weasley, and Emma Watson as Hermione Granger. Its story follows Harry's first year at Hogwarts School of Witchcraft and Wizardry as he discovers that he is a famous wizard and begins his formal wizarding education.",
    genre: "fantasy, Adventure, Children's film, Narrative",
    director: 'Chris Columbus',
    imageurl: '',
  },
  {
    id: 5,
    title: 'Harry Potter and the Order of the Phoenix',
    Description:
      "Harry Potter and the Philosopher's Stone (released in the United States, India and the Philippines as Harry Potter and the Sorcerer's Stone) is a 2001 fantasy film directed by Chris Columbus and distributed by Warner Bros. Pictures, based on J. K. Rowling's 1997 novel of the same name. Produced by David Heyman and screenplay by Steve Kloves, it is the first instalment of the Harry Potter film series. The film stars Daniel Radcliffe as Harry Potter, with Rupert Grint as Ron Weasley, and Emma Watson as Hermione Granger. Its story follows Harry's first year at Hogwarts School of Witchcraft and Wizardry as he discovers that he is a famous wizard and begins his formal wizarding education.",
    genre: "fantasy, Adventure, Children's film, Narrative",
    director: 'Chris Columbus',
    imageurl: '',
  },
  {
    id: 6,
    title: 'Harry Potter and the Half-Blood Prince',
    Description:
      "Harry Potter and the Philosopher's Stone (released in the United States, India and the Philippines as Harry Potter and the Sorcerer's Stone) is a 2001 fantasy film directed by Chris Columbus and distributed by Warner Bros. Pictures, based on J. K. Rowling's 1997 novel of the same name. Produced by David Heyman and screenplay by Steve Kloves, it is the first instalment of the Harry Potter film series. The film stars Daniel Radcliffe as Harry Potter, with Rupert Grint as Ron Weasley, and Emma Watson as Hermione Granger. Its story follows Harry's first year at Hogwarts School of Witchcraft and Wizardry as he discovers that he is a famous wizard and begins his formal wizarding education.",
    genre: "fantasy, Adventure, Children's film, Narrative",
    director: 'Chris Columbus',
    imageurl: '',
  },
];

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.get('/movies/:title', (req, res) => {
  res.json(
    movies.find((movie) => {
      return movie.title === req.params.title;
    })
  );
});

app.get('/movies/genres/:title', (req, res) => {
  res.json(movies[1].genre);
});

app.get('/movies/directors/:directorname', (req, res) => {
  res.send('Chris Columbus');
});

app.put('/users/:username', (req, res) => {
  res.status(500).send('Feature is not available now!');
});

app.post('/users', (req, res) => {
  let newUser = req.body;
  newUser.id = uuid.v4();
  users.push(newUser);
  return res.status(201).send(newUser);
});

app.delete('/users/:id', (req, res) => {
  res.status(201).send('User is deleted.');
});

app.post('/movies/collections', (req, res) => {
  let newMovie = req.body;
  newMovie.id = uuid.v4();
  collections.push(newMovie);
  return res.status(201).send(newMovie);
});

app.delete('/movies/collections/:title', (req, res) => {
  let movie = movies.find((movie) => {
    return movie.title === req.params.title;
  });
  if (movie) {
    movies = movies.filter((obj) => {
      return obj.title !== req.params.title;
    });
    res.status(201).send('movie' + req.params.title + 'was deleted.');
  }
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
