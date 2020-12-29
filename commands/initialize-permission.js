const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

const express = require('express');
const app = express();

const port = 8500;

const db = require('./../config/db');

MongoClient.connect(db.url, (err, database) => {
    const dbMongo = database.db("dbemtuition");
    if (err) return console.log(err)
    insertPermission(dbMongo);
});

function insertPermission(db) {
    const permissions = [
        {
            name: 'student'
        },
        {
            name: 'payment'
        },
        {
            name: 'report'
        },
        {
            name: 'teacher'
        },
        {
            name: 'class'
        }
    ];

    const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');

    for (let i = 0; i < permissions.length; i++) {
        permissions[i]._id = i + 1;
        permissions[i].created_date = createdDate;
    }

    db.collection('permission').remove({});
    db.collection('permission').insertMany(permissions);
}
