var csrf = require('csurf');

// Create base middleware
var middleware = function() {
    return csrf();
};

// Add CSRF tokens to locals for GET requests so they can be added to forms
// when needed
middleware.addLocals = function() {
    return function(request, response, next) {
        if (request.method != 'GET') return next();
        response.locals._csrf = request.csrfToken();
        next();
    };
};

// export public interface
module.exports = middleware;