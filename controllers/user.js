var User = require('../models/User');
var Session = require('../models/Session');

// Render form to create a new user account
exports.showUser = function(request, response, next) {
    var requestedUsername = request.param('username');

    // Can only view user details for your user
    if (request.user.username === requestedUsername) {
        return response.render('user/show');
    }

    // Otherwise we'll 404
    next();
};

// Render form to create a new user account
exports.showCreate = function(request, response) {
    response.render('user/create');
};

// Handle POST request to create user
exports.create = function(request, response) {
    var opts = request.body;
    var user = new User(
        opts.username,
        opts.fullName,
        opts.phone,
        opts.contactType,
        opts.password
    );

    // Attempt to save the user object
    user.save(function(err, newUser) {
        if (err) {
            // Problem creating user object
            console.log(err);
            request.flash('danger', err.message);
            response.redirect('/signup');
        } else {
            // Success! Create authenticated session for user
            var sess = new Session(newUser);
            // On sign up, don't require the 2FA step to verify
            sess.verified = true;

            sess.save(function(err, newSession) {
                if (err) {
                    // Problem creating session
                    request.flash('danger', 'User created, but we could not ' 
                        + 'log you in. Please try logging in again.');
                    response.redirect('/');
                } else {
                    // Save session id in HTTP session
                    request.session.sessionToken = newSession.token;

                    // Redirect to user details page
                    request.flash('success', 'Welcome, '+newUser.fullName+'!');
                    response.redirect('/users/'+newUser.username);
                }
            });
        }
    });
};