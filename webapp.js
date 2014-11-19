var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');
var methodOverride = require('method-override');
var flash = require('./middleware/flash');
var csrf = require('./middleware/csrf');
var userSession = require('./middleware/session');
var config = require('./config');

// Create Express web app
var app = express();
app.set('view engine', 'jade');

// Use morgan for HTTP request logging
app.use(morgan('combined'));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Override HTTP methods from a query parameter
app.use(methodOverride('_method'));

// Parse incoming form-encoded HTTP bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

// Create and manage HTTP sessions for all requests
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));

// Configure middleware to manage "flash" messages
app.use(flash());
app.use(flash.addLocals());

// Generate and handle CSRF tokens for all requests
app.use(csrf());
app.use(csrf.addLocals());

// Mount middleware to add user to authenticated requests
app.use(userSession());

// Configure application routes
require('./controllers/router')(app);

// Handle 404
app.use(function (request, response, next) {
    response.status(404);
    response.sendFile(path.join(__dirname, 'public', '404.html'));
});

// Unhandled errors (500)
app.use(function(err, request, response, next) {
    console.error('An application error has occurred:');
    console.error(err);
    console.error(err.stack);

    if (err.code === 'EBADCSRFTOKEN') {
        // Attempt to recover from a CSRF error
        var message = 'There was a problem with your request - please retry.';
        request.flash('danger', message);
        response.redirect('/');
    } else {
        // Otherwise serve error page
        response.status(500);
        response.sendFile(path.join(__dirname, 'public', '500.html'));
    }
});

// Export Express app
module.exports = app;