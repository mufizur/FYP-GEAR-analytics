var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

//temporary data store
var users = {};

module.exports = function(passport){
	//Serializing Users
	passport.serializeUser(function(user, done){
		console.log('serializing user : ', user.username);
		return done(null, user.username);
	});

	//Deserializaing users
	passport.deserializeUser(function(username, done){
		return done(null, users[username]);
	});

	//For login
	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done){
			
			//Check if user exists
			if(!users[username]){
				return done('user not found', false);
			}

			//Check if password is correct
			if(!isValidPassword(users[username], password)){
				return done('invalid password', false);
			}

			//Successfully logged in;
			return done(null, user[username]);
		}
	));

	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	}

	// Creating hash using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	}
}