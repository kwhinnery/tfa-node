var Session = require('../models/Session');
var User = require('../models/User');

// To be run on all requests - looks for a session ID and loads the user
// associated with it
var middleware = function() {
    return function(request, response, next) {
        var sessionToken = request.session.sessionToken;
        if (sessionToken) {
            // see if we have a session for this ID
            Session.findByToken(sessionToken, function(err, session) {
                if (err || !session) return next();
                request.user = session.user;
                response.locals.user = session.user;
                next();
            });
        } else {
            next();
        }
    };
};

// A custom middleware function that checks for a currently logged in user, and
// redirects home if none is found
middleware.requireLogin = function() {
    return function(request, response, next) {
        // If we have a user we're GTG
        if (request.user) return next();

        // otherwise deny
        request.flash('danger', 'Login required.');
        response.status(403).redirect('/login');
    };
};

module.exports = middleware;