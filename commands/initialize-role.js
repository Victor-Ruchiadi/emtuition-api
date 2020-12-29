const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

const express = require('express');
const app = express();

const port = 8500;

const db = require('./../config/db');

MongoClient.connect(db.url, (err, database) => {
    const dbMongo = database.db("dbemtuition");
    if (err) return console.log(err)
    insertRole(dbMongo);
});

function insertRole(db) {
    const roles = [
        {
            name: 'admin'
        },
        {
            name: 'user_teacher'
        },
        {
            name: 'user_student'
        },
        {
            name: 'user_temporarily'
        }
    ];

    const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss'); 

    for (let i = 0; i < roles.length; i++) {
        roles[i]._id = i + 1;
        roles[i].created_date = createdDate;
    }
   
    db.collection('role').remove({});
    db.collection('role').insertMany(roles);
}
