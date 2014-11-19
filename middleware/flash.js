var flash = require('connect-flash');

// Add flash messages to requests to persist across reloads
var middleware = function() {
    return flash();
};

// Configure flash messages to add to responses if present
var flashKeys = ['primary', 'success', 'info', 'warning', 'danger'];

// Add flash messages to local variables
middleware.addLocals = function() {
    return function(request, response, next) {

        // Add any flash messages to locals for rendering
        flashKeys.forEach(function(key) {
            var list = request.flash(key);
            if (list.length > 0) {
                response.locals[key] = list;
            }
        });

        // Continue request processing
        next();
    };
};

module.exports = middleware;