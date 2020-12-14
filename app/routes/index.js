const routesAuth = require('./auth.routes');
const controllers = require('./../controllers/index');

module.exports = function(app, db) {
    routesAuth(app, db, controllers.auth);
    // Other route groups could go here, in the future
};