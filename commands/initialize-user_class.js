const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

const express = require('express');
const app = express();

const port = 8500;

const db = require('./../config/db');

MongoClient.connect(db.url, (err, database) => {
    const dbMongo = database.db("dbemtuition");
    if (err) return console.log(err)
    insertUserClass(dbMongo);
});

function insertUserClass(db) {
    const userClasses = [
        {
            student_id: 2,
            teacher_id: 3,
            class_id: 1
        }
    ];

    const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');

    for (let i = 0; i < userClasses.length; i++) {
        userClasses[i]._id = i + 1;
        userClasses[i].created_date = createdDate;
        userClasses[i].is_active = 1;
    }

    db.collection('user_class').remove({});
    db.collection('user_class').insertMany(userClasses);
}
