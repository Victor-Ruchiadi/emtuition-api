const MongoClient = require('mongodb').MongoClient;
const Bcrypt = require('bcryptjs');
const salt = 10;
const moment = require('moment');

const express = require('express');
const app = express();

const port = 8500;

const db = require('./../config/db');

MongoClient.connect(db.url, (err, database) => {
    const dbMongo = database.db("dbemtuition");
    if (err) return console.log(err)
    insertUser(dbMongo);
});

function insertUser(db) {
    const users = [
        {
            username: 'victor',
            role_id: 1
        },
        {
            username: 'user',
            role_id: 3
        },
        {
            username: 'teacher',
            role_id: 2
        }
    ];

    const password = '123456';
    const defaultPass = Bcrypt.hashSync(password, salt);
    const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss'); 

    for (let i = 0; i < users.length; i++) {
        users[i]._id = i + 1;
        users[i].password = defaultPass;
        users[i].created_date = createdDate;
        users[i].is_active = 1;
    }


    db.collection('user').remove({});
    db.collection('user').insertMany(users);
}
