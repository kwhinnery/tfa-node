var Joi = require('Joi');

// A mock database with users and passwords
var database = {};

// A validation schema for user objects
var UserSchema = Joi.object().keys({
    username: Joi.string().alphanum().required(),
    fullName: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().required(),
    contactType: Joi.any().allow('text', 'voice')
});

// A user model object
function User(username, fullName, phone, contactType, password) {
    this.username = username;
    this.fullName = fullName;
    this.phone = phone;
    this.contactType = contactType;
    this.password = password;
}

// Create a "save" instance function to save the user to the database
User.prototype.save = function(callback) {
    var self = this;

    // Perform validation on object properties
    Joi.validate(self, UserSchema, {
        allowUnknown: true
    }, function(err, value) {
        if (err) return callback.call(self, err, value);

        // Check uniqueness of ID in the "database"
        // Username needs to be unique
        if (!database[self.username]) {
            database[self.username] = self;
            callback.call(self, null, self);
        } else {
            callback.call(self, new Error('Username has been taken.'));
        }
    });
};

// A "class level" function to test a username/password combo
User.login = function(username, password, callback) {
    // Create variables for a node-style callback
    var error = new Error('Username/password combination is invalid');
    var user = null;

    // see if there's a user with the given username
    var candidateUser = database[username];

    // If we have a user, check the password
    if (candidateUser) {
        if (candidateUser.password === password) {
            // At this point, can reverse the error and hydrate a user object
            error = null;
            user = candidateUser;
        }
    }

    // Simulate a database round trip with a timer
    setTimeout(function() {
        callback.call(this, error, user);
    }, 50);
};

// Retrieve a user from our database by a given username
User.findByUsername = function(username, callback) {
    // Create variables for a node-style callback
    var error = new Error('No user found for given ID.');
    var user = null;

    // see if there's a user with the given username
    var candidateUser = database[username];

    // If we have a user, hydrate a model object
    if (candidateUser) {
        error = null;
        user = new User(candidateUser.username, candidateUser.fullName);
    }

    // Simulate latency
    setTimeout(function() {
        callback.call(this, error, user);
    }, 50);
};

// Export user constructor as public interface
module.exports = User;