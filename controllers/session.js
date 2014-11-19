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
            // If password was correct, create a new session for the user
            var sess = new Session(user);

            // Save the session object, then do the 2FA step
            sess.save(function(err, newSession) {
                if (err) {
                    request.flash('danger', 'There was a problem logging'
                        + ' you in - please try again.');
                    response.redirect('/login');
                } else {
                    // if all is well, proceed to second auth step and send
                    // a one-time password to the user's phone
                    newSession.sendVerification(function(err, result) {
                        if (err) {
                            request.flash('danger', 'Error sending validation '
                                + 'code - please try again.');
                            response.redirect('/login');
                        } else {
                            // If the code was sent successfully, show the
                            // verification page
                            response.redirect('/sessions/verify/'
                                + newSession.id);
                        }
                    });
                }
            });
        } else {
            // Otherwise, give error and retry
            request.flash('danger', err.message);
            response.redirect('/login');
        }
    });
};

// Show a form where the user can enter a one-time validation password
exports.showVerify = function(request, response, next) {
    Session.findById(request.param('id'), function(err, session) {
        if (session) {
            response.render('session/verify', {
                sessionId: request.param('id')
            });
        } else {
            // 404
            next();
        }
    });
};

// Handle a session validation request
exports.verify = function(request, response, next) {
    Session.findById(request.param('id'), function(err, session) {
        if (session) {
            // If we have a session, try to validate it with the code passed
            // in to the form
            if (session.oneTimePassword == request.param('code').trim()) {
                session.verified = true;
                session.save(function(err) {
                    if (err) {
                        request.flash('danger', 'There was a problem verifying'
                            + ' your code, please re-enter it.');
                        response.redirect('/sessions/verify/'+session.id);
                    } else {
                        // if all is well, create a session for the user
                        request.session.sessionId = session.id;
                        request.flash('success', 'Welcome back, '
                            + session.user.fullName + '!');
                        response.redirect('/users/'+session.user.username);
                    }
                });
            } else {
                request.flash('danger', 'Verification code incorrect, please '
                    + 're-enter your code or send yourself a new one.');
                response.redirect('/sessions/verify/'+session.id);
            }
        } else {
            // 404
            next();
        }
    });
};

// Re-send a verification code for the given Session
exports.ajaxResendCode = function(request, response) {
    Session.findById(request.param('id'), function(err, session) {
        if (session) {
            // Try to resend verification code
            session.sendVerification(function(err, data) {
                var message = 'Code has been sent.';
                var success = true;

                if (err) {
                    message = 'There was a problem sending your code, please '
                        + 'try again.';
                    success = false;
                }

                // Send JSON response
                response.send({
                    success: success,
                    message: message
                });
            });
        } else {
            response.send({
                success: false,
                message: 'Session ID not found.'
            });
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