const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

const express = require('express');
const app = express();

const port = 8500;

const db = require('./../config/db');

MongoClient.connect(db.url, (err, database) => {
    const dbMongo = database.db("dbemtuition");
    if (err) return console.log(err)
    insertClass(dbMongo);
});

function insertClass(db) {
    const classes = [
        {
            teacher_id: 3,
            name: '135',
            monday_has_class: true,
            monday_class_time: '16:30-17:00',
            tuesday_has_class: false,
            tuesday_class_time: '',
            wednesday_has_class: true,
            wednesday_class_time: '16:30-17:00',
            thursday_has_class: false,
            thursday_class_time: '',
            friday_has_class: true,
            friday_class_time: '16:30-17:00',
            saturday_has_class: false,
            saturday_class_time: '',
            sunday_has_class: false,
            sunday_class_time: '',
        }
    ];

    const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');

    for (let i = 0; i < classes.length; i++) {
        classes[i]._id = i + 1;
        classes[i].created_date = createdDate;
        classes[i].is_active = 1;
    }

    db.collection('class').remove({});
    db.collection('class').insertMany(classes);
}
