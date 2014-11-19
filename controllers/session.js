var User = require('../models/User');
var Session = require('../models/Session');

// Render a page with a login form
exports.showCreate = function(request, response) {
    response.render('session/create');
};

// Handle a login request from the user and create an authenticated session
exports.create = function(request, response) {
    // Get POST parameters
    var un = request.param('username');
    var pw = request.param('password');

    // Test credentials
    User.login(un, pw, function(err, user) {
        if (!err && user) {
            var sess = new Session(user);
            sess.save(function(err, newSession) {
                if (err) {
                    request.flash('danger', 'There was a problem logging'
                        + ' you in - please try again.');
                    response.redirect('/login');
                } else {
                    // if all is well, create a session for the user
                    request.session.sessionId = newSession.id;
                    request.flash('success', 'Welcome back, '
                        + newSession.user.fullName + '!');
                    response.redirect('/');
                }
            });
        } else {
            // Otherwise, give error and retry
            request.flash('danger', err.message);
            response.redirect('/login');
        }
    });
};

// Log a user out
exports.destroy = function(request, response) {
    var sessionId = request.session.sessionId;
    request.session.sessionId = null;
    Session.destroy(sessionId, function(err) {
        if (err) {
            request.flash('danger', 'Logout failed - please retry');
        } else {
            request.flash('info', 'You have been logged out.');
            response.redirect('/');
        }
    });
};