const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

const express = require('express');
const app = express();

const port = 8500;

const db = require('../config/db');

MongoClient.connect(db.url, (err, database) => {
    const dbMongo = database.db("dbemtuition");
    if (err) return console.log(err)
    insertStudentPaymentLog(dbMongo);
});

function insertStudentPaymentLog(db) {
    const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');
    const studentPaymentLogs = [
        {
            'payment_id': 1,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 2,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 3,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 4,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 5,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 6,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 7,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 8,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 9,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 10,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 11,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 12,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 13,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        },
        {
            'payment_id': 14,
            'payments': [
                {
                    'payment_amount': 200000,
                    'payment_date': moment().format('MMMM YYYY'),
                    'payment_for': 'DESCRIPTION',
                    'created_date': createdDate
                }
            ]
        }
    ];

    for (let i = 0; i < studentPaymentLogs.length; i++) {
        studentPaymentLogs[i]._id = i + 1;
        studentPaymentLogs[i].created_date = createdDate;
        studentPaymentLogs[i].is_active = 1;
    }

    db.collection('student_payment_log').remove({});
    db.collection('student_payment_log').insertMany(studentPaymentLogs);
}
