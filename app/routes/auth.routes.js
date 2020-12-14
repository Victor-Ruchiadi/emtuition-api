var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db, controllers) {
    app.get('/api', (req, res) => {
        // You'll create your note here.    
        res.send('Welcome to server')
    });
    app.post('/api/register', async (req, res) => await controllers.register(req,res,db));
    app.post('/api/login', async(req, res) => await controllers.login(req,res,db));
    app.post('/api/authentication', async(req, res) => await controllers.authentication(req,res,db));
    app.post('/api/password/change', async(req, res) => await controllers.changePassword(req,res,db));
    app.post('/api/google/register', async (req, res) => await controllers.googleRegister(req, res, db));
    app.post('/api/facebook/register', async (req, res) => await controllers.facebookRegister(req, res, db));
    app.post('/api/google/unbind', async (req, res) => await controllers.googleUnbind(req, res, db));
    app.post('/api/facebook/unbind', async (req, res) => await controllers.facebookUnbind(req, res, db));
    app.post('/api/google/login', async (req, res) => await controllers.googleLogin(req, res, db));
    app.post('/api/facebook/login', async (req, res) => await controllers.facebookLogin(req, res, db));
};