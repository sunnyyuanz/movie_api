const passport = require('passport'),
//defines basic HTTP authentication for login requests. 
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./model.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
//set up JWT authentication code, it allows you to authenticate uers based on the JWT submitted alongside their request.
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

    //only check for username here, no password check yet
passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username,password,callback) => {
    console.log(username + ' ' +password);
    Users.findOne({Username:username},(error,user)=>{
        if(error){
            console.log(error);
            return callback(error);
        }

        if(!user){
            console.log('incorrect username');
//if an error occurs, or if the username can't be found within the database, an error message is passed to the callback 
            return callback(null,false, {message:'Incorrect username or password'});
        };

        if(!user.validatePassword(password)){
            console.log('incorrect password');
            return callback(null, false, {message: 'Incorrect password.'});
        }

        console.log('finished');
        return callback(null,user);
    });
}));

passport.use(new JWTStrategy({
//In the code below, the JWT is extracted from the header of the HTTP request
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, (jwtPayload,callback)=>{
    return Users.findById(jwtPayload._id)
        .then((user)=>{
            return callback(null,user);
        })
        .catch((error)=>{
            return callback(error)
        })
}))

