const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

const express = require('express');
const app = express();

const port = 8500;

const db = require('./../config/db');

MongoClient.connect(db.url, (err, database) => {
    const dbMongo = database.db("dbemtuition");
    if (err) return console.log(err)
    insertRolePermission(dbMongo);
});

function insertRolePermission(db) {
    const rolePermissions = [
        {
            role_id: 1,
            permission_id: 1,
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
        },
        {
            role_id: 1,
            permission_id: 2,
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
        },
        {
            role_id: 1,
            permission_id: 3,
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
        },
        {
            role_id: 1,
            permission_id: 4,
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
        },
        {
            role_id: 1,
            permission_id: 5,
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
        },
        {
            role_id: 2,
            permission_id: 1,
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
        },
        {
            role_id: 2,
            permission_id: 2,
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
        },
        {
            role_id: 2,
            permission_id: 3,
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
        },
        {
            role_id: 2,
            permission_id: 5,
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
        }
    ];

    const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');

    for (let i = 0; i < rolePermissions.length; i++) {
        rolePermissions[i]._id = i + 1;
        rolePermissions[i].created_date = createdDate;
        rolePermissions[i].is_active = 1;
    }

    db.collection('role_permission').remove({});
    db.collection('role_permission').insertMany(rolePermissions);
}
