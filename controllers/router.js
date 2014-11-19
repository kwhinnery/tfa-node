var pages = require('./pages');
var user = require('./user');
var session = require('./session');
var userSession = require('../middleware/session');

// Map routes to controller functions
module.exports = function(app) {
    app.get('/', pages.home);

    // User routes
    app.get('/users/:username', userSession.requireLogin(), user.showUser);
    app.get('/users/new', user.showCreate);
    app.post('/users', user.create);
    app.get('/signup', user.showCreate);
    app.post('/signup', user.create);

    // Session routes
    app.get('/sessions/new', session.showCreate);
    app.post('/sessions', session.create);
    app.delete('/sessions', session.destroy);
    app.get('/login', session.showCreate);
    app.post('/login', session.create);
    app.delete('/logout', session.destroy);
};