var pages = require('./pages');
var user = require('./user');
var session = require('./session');
var userSession = require('../middleware/session');

// Map routes to controller functions
module.exports = function(app) {
    app.get('/', pages.home);

    // User routes
    app.get('/users/new', user.showCreate);
    app.get('/users/:username', userSession.requireLogin(), user.showUser);
    app.post('/users', user.create);
    app.get('/signup', user.showCreate);
    app.post('/signup', user.create);

    // Session routes
    app.get('/sessions/new', session.showCreate);
    app.get('/sessions/verify/:id', session.showVerify);
    app.post('/sessions', session.create);
    app.post('/sessions/verify/:id', session.verify);
    app.post('/sessions/verify/:id/resend', session.ajaxResendCode);
    app.delete('/sessions', session.destroy);
    app.get('/login', session.showCreate);
    app.post('/login', session.create);
    app.delete('/logout', session.destroy);
};