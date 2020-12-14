const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const cors = require('cors');
const express = require('express');
const app = express();
app.use(cors());

const port = 8500;

const db = require('./config/db');

var jwt = require('express-jwt');
const dotenv = require('dotenv');
dotenv.config()

app.use(bodyParser.json());
app.use(jwt({ secret: process.env.TOKEN_SECRET, algorithms: ['HS384'] }).unless({
    path: [
        '/api/register',
        '/api/login',
        '/api/google/login',
        '/api/facebook/login'
    ]
}));
app.use((err, req, res, next) => {

    if (err && err.name === 'UnauthorizedError') {
        res.status(401).json({ "error": err.name + ": " + err.message })
    }
    // console.log('err', err)
});

MongoClient.connect(db.url, (err, database) => {
    const dbMongo = database.db("dbemtuition");
    if (err) return console.log(err)
    require('./app/routes')(app, dbMongo);
    app.listen(port, () => { console.log('We are live on ' + port); });
});