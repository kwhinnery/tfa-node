var speakeasy = require('speakeasy');
var config = require('../config');

// A mock database for authenticated sessions
var database = {};

// Create a session for a given unique user, with a randomly generated ID
function Session(user) {
    this.user = user;
    this.id = speakeasy.generate_key({
        length: 30
    }).hex;
}

// Save a given session to our "database"
Session.prototype.save = function(callback) {
    var self = this;
    database[self.id] = self;

    // simulate latency
    setTimeout(function() {
        callback.call(self, null, self);
    }, 50);
};

// Check to see if a given session exists
Session.findById = function(sessionId, callback) {
    // Create node-style callback arguments
    var error = new Error('No session found by the given ID.');
    var session = null;

    // Check for the given session id in our "database"
    if (database[sessionId]) {
        error = null;
        session = database[sessionId];
    }

    // simulate latency and trigger callback
    setTimeout(function() {
        callback.call(this, error, session);
    }, 50);
};

// Remove a session from the database
Session.destroy = function(sessionId, callback) {
    // If it exists, remove it
    if (database[sessionId]) {
        delete database[sessionId];
    }

    // always succeeds
    setTimeout(callback, 50);
};

// Export user constructor as public interface
module.exports = Session;