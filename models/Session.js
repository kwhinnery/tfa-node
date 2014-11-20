var speakeasy = require('speakeasy');
var twilio = require('twilio');
var config = require('../config');

// A mock database for authenticated sessions
var database = {};

// Create an authenticated twilio REST API client
var client = twilio(config.accountSid, config.authToken);

// A public service that simply echoes back TwiML that you pass it - we use
// it here so we don't have to worry about knowing our app's URL ahead of time
var twimlet = 'http://twimlets.com/echo?Twiml=';

// Helper function to send out a code via twilio to a given number
function sendCode(code, type, number, callback) {
    // Send the new token over the requested channel
    if (type === 'voice') {
        client.makeCall({
            to: number,
            from: config.twilioNumber,
            url: twimlet + encodeURIComponent(readCode(code))
        }, callback);
    } else {
        client.sendMessage({
            to: number,
            from: config.twilioNumber,
            body: 'Your confirmation code is: '+ code
        }, callback);
    }
}

// Generate TwiML to read out a given confirmation code via TTS
function readCode(code) {
    // Split up numbers so the user can hear each one individually
    var numbers = code.split('');
    var twiml = new twilio.TwimlResponse();
    twiml.say('Your verification code is', {
        voice: 'alice'
    });

    function appendCode(number) {
        twiml.say(number, { voice: 'alice' });
    }

    // Say the number once...
    numbers.forEach(appendCode);

    // Prompt again...
    twiml.say('Once again, your confirmation code is:', {
        voice: 'alice'
    });

    // Say the number again...
    numbers.forEach(appendCode);

    // Prompt again...
    twiml.say('One last time, your confirmation code is:', {
        voice: 'alice'
    });

    // Say the number a final time...
    numbers.forEach(appendCode);

    // Terminate the TwiML markup
    twiml.say('Thank you!', { voice: 'alice' });

    return twiml.toString();
}

// Create a session for a given unique user, with a randomly generated ID
// to identify it and another to store in session
function Session(user) {
    this.user = user;
    this.verified = false;
    this.id = speakeasy.generate_key({
        length: 32
    }).hex;
    this.token = speakeasy.generate_key({
        length: 64
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

// Send a one-time password to the phone associated with the user
Session.prototype.sendVerification = function(callback) {
    var self = this;

    // generate a time-based one-time password
    self.oneTimePassword = speakeasy.totp({
        key: config.secret
    });

    // Send the code to the user's phone
    var user = self.user;
    sendCode(self.oneTimePassword, user.contactType, user.phone, callback);
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

// Find a session by the given token
Session.findByToken = function(token, callback) {
    var session = null;

    // Loop through session "database" and see if we have a session with that
    // token
    for (var s in database) {
        if (database.hasOwnProperty(s)) {
            var current = database[s];
            if (current.token === token) {
                session = current;
                break;
            }
        }
    }

    // simulate latency and trigger callback
    setTimeout(function() {
        callback.call(this, null, session);
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