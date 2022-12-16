const mongoose = require('mongoose'); //mongoose is used to configure the model and schema of mongodb database. Give it a standard format.
const bcrypt = require('bcrypt'); //it's a model used in nodejs for hash users' password and compare hashed passwords every time users log in for more secure login authentication.

let movieSchema = mongoose.Schema({
  Title: { type: String, require: true },
  Description: { type: String, require: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
    Birth: String,
  },
  ImagePath: String,
  Featured: Boolean,
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: false },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  Wishlist: [{ type: mongoose.Schema.Types.ObjectId }],
});

//hashing of submitted passwords
//below code used in index.js as users.hashPassword
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

//ompares submitted hashed passwords with the hashed passwords stored in your database
//below code used in index.js as users.validatePassword
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema); //combine movie and movie schema to built mongoose model Movie
let User = mongoose.model('User', userSchema); //combine user and user schema to built mongoose model Movie

module.exports.Movie = Movie;
module.exports.User = User;
