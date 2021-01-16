const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

const express = require('express');
const app = express();

const port = 8500;

const db = require('../config/db');

MongoClient.connect(db.url, (err, database) => {
    const dbMongo = database.db("dbemtuition");
    if (err) return console.log(err)
    insertClassUserPayment(dbMongo);
});

function insertClassUserPayment(db) {
    const classUserPayments = [
        {
            'student_id': 2,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 2,
            'amount': 200000,
            'class_id': 2
        },
        {
            'student_id': 4,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 6,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 7,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 8,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 9,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 10,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 11,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 12,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 13,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 14,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 15,
            'amount': 200000,
            'class_id': 1
        },
        {
            'student_id': 16,
            'amount': 200000,
            'class_id': 1   
        }
    ];

    const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');

    for (let i = 0; i < classUserPayments.length; i++) {
        classUserPayments[i]._id = i + 1;
        classUserPayments[i].created_date = createdDate;
        classUserPayments[i].is_active = 1;
    }

    db.collection('class_user_payment').remove({});
    db.collection('class_user_payment').insertMany(classUserPayments);
}
