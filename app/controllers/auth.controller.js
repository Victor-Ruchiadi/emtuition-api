// var bcrypt = dcodeIO.bcrypt;
const Bcrypt = require('bcryptjs');
const { error } = require('console');
const moment = require('moment');
/** One way, can't decrypt but can compare */
var salt = 10;

const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');


async function register(req, res, db) {
    try {
        req.body.password = Bcrypt.hashSync(req.body.password, salt);
        const user = {
            username: req.body.username,
            password: req.body.password
        };
        await db.collection('user').insert(user);

        res.send(user);
    } catch (error) {
        console.log(error);
        res.send({
            'type': 'error',
            'message': 'insert error!'
        });
    }

}

async function login(req, res, db) {
    let userGoogle = false;
    let userFacebook = false;
    console.log(req.body);
    const details = {
        'username': req.body.username
    };

    console.log('details', details)
    try {
        let user = await db.collection('user').findOne(details);
        if (user) {
            console.log(req.body.password, 'req.body.password');
            if (user.google) {
                userGoogle = true;
            }
            if (user.facebook) {
                userFacebook = true;
            }
            if (user.is_active != 1) {
                return res.send ({
                    'message': 'not active user'
                })
            }
            let userRole = user.role_id;
            let passwordChecker = Bcrypt.compareSync(req.body.password, user.password);
            console.log(passwordChecker, 'passwordChecker');
            if (passwordChecker) {
                dotenv.config();
                let token = jwt.sign({ 
                    username: req.body.username,
                    role_id: userRole,
                    google: userGoogle,
                    facebook: userFacebook
                }, process.env.TOKEN_SECRET, {algorithm: 'HS384'}, { expiresIn: 72000 });
                return res.send({ 
                    'message': 'successful authenticated!', 
                    'token': token, 
                    'username': req.body.username, 
                    'google': userGoogle, 
                    'facebook': userFacebook,
                    'permissions': await checkPermission(req, res, db, token)
                });
            } else {
                return res.send('falseeeeee')
            }
        } else {
            return res.send({ 'message': 'invalid credential' });
        }
    } catch (error) {
        console.log('some error', error);
        return res.send({ 'message': 'unexpected error! Please contact Victor!' });
    }
}

async function authentication (req, res, db) {
    console.log(req.body);
    const token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log(decoded.username);
    res.send('SUCCESSS OHHHHH')
}

async function changePassword (req, res, db) {
    const details = {
        'username': req.body.username
    };

    console.log('details', details)
    try {
        const updatedDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        let user = await db.collection('user').findOne(details);
        if (user) {
            let passwordChecker = Bcrypt.compareSync(req.body.old_password, user.password);
            console.log(passwordChecker, 'passwordChecker');
            if (passwordChecker) {
                user.password = Bcrypt.hashSync(req.body.new_password, salt);
                res.send({
                    'user': user
                })
                await db.collection('user').update(
                    {
                       username : user.username 
                    }, {
                    $set: {
                    "password": user.password,
                    'updated_date': updatedDate
                    }
                });
            } else {
                return res.send('falseeeeee')
            }
        } else {
            return res.send({ 'message': 'invalid credential' });
        }
    } catch (error) {
        console.log('some error', error);
        return res.send({ 'message': 'unexpected error! Please contact Victor!' });
    }  
}

async function googleRegister (req, res, db) {
    try{
        const token = req.headers.authorization.split('Bearer ').pop();
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = {
            username: decoded.username,
            email: req.body.email,
            id_token: req.body.id_token,
            name: req.body.name,
            photo_url: req.body.photo_url,
            id: req.body.id
        }
        await db.collection('user').update(
            {
                username: user.username
            }, {
            $set: {
                "google": {
                    "email": user.email,
                    "name": user.name,
                    "photo_url": user.photo_url,
                    "id": user.id,
                    "id_token": user.id_token
                }
            }
        });

        res.send(user);
    } catch (err) {
        console.log(error);
        res.send({
            'type': 'error',
            'message': 'insert error!'
        });
    }
}

async function facebookRegister(req, res, db) {
    try {
        const token = req.headers.authorization.split('Bearer ').pop();
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = {
            username: decoded.username,
            email: req.body.email,
            name: req.body.name,
            photo_url: req.body.photo_url,
            id: req.body.id
        }
        await db.collection('user').update(
            {
                username: user.username
            }, {
            $set: {
                "facebook": {
                    "email": user.email,
                    "name": user.name,
                    "photo_url": user.photo_url,
                    "id": user.id
                }
            }
        });

        res.send(user);
    } catch (err) {
        console.log(error);
        res.send({
            'type': 'error',
            'message': 'insert error!'
        });
    }
}

async function googleUnbind(req, res, db) {
    const token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const details = {
        'username': decoded.username
    };

    console.log('details', details)
    try {
        let user = await db.collection('user').findOne(details);
        if (user) {
            delete user.google;
            res.send(user);
            await db.collection('user').update(
                {
                    username: user.username
                }, user
            );
        } else {
            return res.send({ 'message': 'invalid credential' });
        }
    } catch (error) {
        console.log('some error', error);
        return res.send({ 'message': 'unexpected error! Please contact Victor!' });
    }
}

async function facebookUnbind(req, res, db) {
    const token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const details = {
        'username': decoded.username
    };

    console.log('details', details)
    try {
        let user = await db.collection('user').findOne(details);
        if (user) {
            delete user.facebook;
            res.send(user);
            await db.collection('user').update(
                {
                    username: user.username
                }, user
            );
        } else {
            return res.send({ 'message': 'invalid credential' });
        }
    } catch (error) {
        console.log('some error', error);
        return res.send({ 'message': 'unexpected error! Please contact Victor!' });
    } 
}

async function googleLogin (req, res, db) {
    let userGoogle = false;
    let userFacebook = false;
    const details = {
        "google.email": req.body.email
    };
    try {
        let user = await db.collection('user').findOne(details);
        if (user) {
            if (user.google) {
                userGoogle = true;
            }
            if (user.facebook) {
                userFacebook = true;
            }
            if (user.is_active != 1) {
                return res.send({
                    'message': 'not active user'
                })
            }
            let userRole = user.role_id;
            dotenv.config();
            let token = jwt.sign({
                username: user.username,
                role_id: userRole,
                google: userGoogle,
                facebook: userFacebook
            }, process.env.TOKEN_SECRET, { algorithm: 'HS384' }, { expiresIn: 72000 });
            if (token) {
                return res.send({ 'type': 'success', 'message': 'successful authenticated!', 'token': token, 'username': user.username, 'google': userGoogle, 'facebook': userFacebook, 'permissions': await checkPermission(req, res, db, token) });                
            } else {
                return res.send({ 'type': 'error','message': 'Error has occured!'})
            }
        } else {
            return res.send({ 'type': 'error','message': 'No user with such a Google account' })
        }
    } catch (error) {
        return res.send({ 'type': 'error','message': 'unexpected error! Please contact Victor!' });
    }
}

async function facebookLogin(req, res, db) {
    let userGoogle = false;
    let userFacebook = false;
    const details = {
        "facebook.email": req.body.email
    };
    try {
        let user = await db.collection('user').findOne(details);
        if (user) {
            if (user.google) {
                userGoogle = true;
            }
            if (user.facebook) {
                userFacebook = true;
            }
            if (user.is_active != 1) {
                return res.send({
                    'message': 'not active user'
                })
            }
            let userRole = user.role_id;
            dotenv.config();
            let token = jwt.sign({
                username: user.username,
                role_id: userRole,
                google: userGoogle,
                facebook: userFacebook
            }, process.env.TOKEN_SECRET, { algorithm: 'HS384' }, { expiresIn: 72000 });
            if (token) {
                return res.send({ 
                    'type': 'success',
                    'message': 'successful authenticated!', 
                    'token': token, 
                    'username': user.username, 
                    'google': userGoogle, 
                    'facebook': userFacebook,
                    'permissions': await checkPermission(req, res, db, token)
                 });
            } else {
                return res.send({ 'type': 'error','message': 'Error has occured!' })
            }
        } else {
            return res.send({ 'type': 'error','message': 'No user with such a Google account' })
        }
    } catch (error) {
        console.log('some error', error);
        return res.send({ 'type': 'error','message': 'unexpected error! Please contact Victor!' });
    }
}

async function checkPermission (req, res, db, token) {
    var tokenInHeader = false
    if (!token) {
        tokenInHeader = true;
        token = req.headers.authorization.split('Bearer ').pop();
    }
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    const details = {
        'role_id': roleId
    }
    console.log(details, 'details');
    console.log(roleId, 'role_id');
    try {
        let permissions = await db.collection('role_permission').find(details).toArray();
        if (tokenInHeader) {
            return res.send(permissions)
        } else {
            return permissions;
        }
    }
    catch(err) {
        console.log(err);
        res.send(err)
    }
}

async function getAllTeachers (req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    let username = decoded.username;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send('Access forbiden')
    }
    let details = {
        'role_id': 2,
        'is_active': 1
    }
    try {
        let teachers = await db.collection('user').find(details).toArray();
        return res.send({
            'teachers': teachers,
            'roleId': roleId,
            'username': username
        });
    }
    catch (err) {
        return res.send('ERRORRRR');
    }
}

async function deleteTeacher(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1) {
        return res.send('Access forbiden')
    }
    const details = {
        "_id": req.body.id,
        'is_active': 1
    }
    try {
        const deletedDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        let user = await db.collection('user').findOne(details);
        console.log(user)
        if (user) {
            if (user.role_id === 2) {
                await db.collection('user').update(
                    {
                        _id: req.body.id,
                        role_id: 2
                    }, {
                    $set: {
                        "is_active": 0,
                        'deleted_date': deletedDate
                    }
                });
                return res.send('success');
            } else {
                return res.send('The user is not a teacher')
            }
        } else {
            return res.send('ERRORRRR')
        }        
    }
    catch (err) {
        console.log(err)
    }
}

async function getTeacherById(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1) {
        return res.send('Access forbiden')
    }
    const details = {
        "_id": req.body.id,
        "role_id": 2,
        'is_active': 1
    }
    try {
        let teacher = await db.collection('user').findOne(details);
        console.log(teacher)
        if (teacher) {
            return res.send(teacher);
        } else {
            return res.send('Error')
        }
    }
    catch (err) {
        return res.send(err)
    }
}

async function changeTeacherData(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1) {
        return res.send('Access forbiden')
    }
    try {
        const updatedDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        let details = {
            "username": req.body.username,
            'is_active': 1
        }
        let usernameIsNotUnique = await db.collection('user').findOne(details);
        if (usernameIsNotUnique) {
            return res.send({
                'type': 'error',
                'message': 'The username is taken'
            })
        }  else {
            if (req.body.username !== '') {
                if (req.body.password === '') {
                    let newUsername = await db.collection('user').update(
                        {
                            _id: req.body.id,
                            role_id: 2,
                            is_active: 1
                        }, {
                        $set: {
                            "username": req.body.username,
                            'updated_date': updatedDate
                        }
                    })
                    return res.send({
                        'type': 'success',
                        'message': 'The user has been updated'
                    });
                } else {
                    let newUserData = await db.collection('user').update(
                        {
                            _id: req.body.id,
                            role_id: 2,
                            is_active: 1
                        }, {
                            $set: {
                                "username": req.body.username,
                                "password": Bcrypt.hashSync(req.body.password, salt),
                                'updated_date': updatedDate
                            }
                        }
                    )
                    if (newUserData.result.n === 1 && newUserData.result.nModified === 1 && newUserData.result.ok === 1) {
                        return res.send({
                            'type': 'success',
                            'message': 'The user has been updated'
                        });
                    } else {
                        return res.send({
                            'type': 'error',
                            'message': 'Some errors occured'
                        })
                    }
                }
            } else {
                if (req.body.password !== '') {
                    let newUserData = await db.collection('user').update(
                        {
                            _id: req.body.id,
                            role_id: '2',
                            is_active: 1
                        }, {
                        $set: {
                            "password": Bcrypt.hashSync(req.body.password, salt),
                            'updated_date': updatedDate
                        }
                    }
                    )
                    if (newUserData.result.n === 1 && newUserData.result.nModified === 1 && newUserData.result.ok === 1) {
                        return res.send({
                            'type': 'success',
                            'message': 'The user has been updated'
                        });
                    } else {
                        return res.send({
                            'type': 'error',
                            'message': 'Some errors occured'
                        })
                    }
                }
            }
        }
    }
    catch (err) {
        console.log(err);
        return res.send({
            'type': 'error',
            'message': 'Some errors occured 531'
        })
    }
}

async function getAllStudents(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    }
    let details = {
        'role_id': 3,
        'is_active': 1
    }
    try {
        let students = await db.collection('user').find(details).toArray();
        return res.send(students)
    }
    catch (err) {
        return res.send('ERRORRRR');
    }
}

async function deleteStudent(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send('Access forbiden')
    }
    const details = {
        "_id": req.body.id,
        'is_active': 1
    }
    try {
        const deletedDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        let user = await db.collection('user').findOne(details);
        console.log(user)
        if (user) {
            if (user.role_id === 3) {
                await db.collection('user').update(
                    {
                        _id: req.body.id,
                        role_id: 3
                    }, {
                    $set: {
                        "is_active": 0,
                        'deleted_date': deletedDate
                    }
                });
                return res.send('success');
            } else {
                return res.send('The user is not a student')
            }
        } else {
            return res.send('ERRORRRR')
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function getStudentById(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send('Access forbiden')
    }
    const details = {
        "_id": req.body.id,
        "role_id": 3,
        'is_active': 1
    }
    try {
        let student = await db.collection('user').findOne(details);
        console.log(student)
        if (student) {
            return res.send(student);
        } else {
            return res.send('Error')
        }
    }
    catch (err) {
        return res.send(err)
    }
}

async function changeStudentData(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send('Access forbiden')
    }
    try {
        const updatedDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        let details = {
            "username": req.body.username,
            'is_active': 1
        }
        let usernameIsNotUnique = await db.collection('user').findOne(details);
        if (usernameIsNotUnique) {
            return res.send({
                'type': 'error',
                'message': 'The username is taken'
            })
        } else {
            if (req.body.username !== '') {
                if (req.body.password === '') {
                    let newUsername = await db.collection('user').update(
                        {
                            _id: req.body.id,
                            role_id: 3,
                            is_active: 1
                        }, {
                        $set: {
                            "username": req.body.username,
                            'updated_date': updatedDate
                        }
                    })
                    return res.send({
                        'type': 'success',
                        'message': 'The user has been updated'
                    });
                } else {
                    let newUserData = await db.collection('user').update(
                        {
                            _id: req.body.id,
                            role_id: 3,
                            is_active: 1
                        }, {
                        $set: {
                            "username": req.body.username,
                            "password": Bcrypt.hashSync(req.body.password, salt),
                            'updated_date': updatedDate
                        }
                    }
                    )
                    if (newUserData.result.n === 1 && newUserData.result.nModified === 1 && newUserData.result.ok === 1) {
                        return res.send({
                            'type': 'success',
                            'message': 'The user has been updated'
                        });
                    } else {
                        return res.send({
                            'type': 'error',
                            'message': 'Some errors occured'
                        })
                    }
                }
            } else {
                if (req.body.password !== '') {
                    let newUserData = await db.collection('user').update(
                        {
                            _id: req.body.id,
                            role_id: 3,
                            is_active: 1
                        }, {
                        $set: {
                            "password": Bcrypt.hashSync(req.body.password, salt),
                            'updated_date': updatedDate
                        }
                    }
                    )
                    if (newUserData.result.n === 1 && newUserData.result.nModified === 1 && newUserData.result.ok === 1) {
                        return res.send({
                            'type': 'success',
                            'message': 'The user has been updated'
                        });
                    } else {
                        return res.send({
                            'type': 'error',
                            'message': 'Some errors occured'
                        })
                    }
                }
            }
        }
    }
    catch (err) {
        console.log(err);
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        })
    }
}

async function getAllClasses (req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    let username = decoded.username;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    }
    if (+roleId === 2) {
        console.log(username);
        let userId = await db.collection('user').findOne({
            'username': username
        })
        userId = userId._id;
        console.log(userId)
        const details = {
            'teacher_id': +userId,
            'is_active': 1
        }
        let classes = await db.collection('class').find(details).toArray();
        return res.send(classes);
    }
    try {
        const details = {
            'is_active': 1
        };
        let classes = await db.collection('class').find(details).toArray();
        return res.send(classes);
    }
    catch (err) {
        return res.send('ERRORRRR');
    }
}

async function addClass (req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    }
    try {
        let details = {
            "name": req.body.name,
            'is_active': 1
        }
        let classnameIsNotUnique = await db.collection('class').findOne(details);
        if (classnameIsNotUnique) {
            return res.send({
                'type': 'error',
                'message': 'The class name is taken'
            })
        }
        let highestId = await db.collection('class').find().sort([['_id', -1]]).limit(1).toArray();
        highestId = highestId[0]._id;
        const newestId = highestId + 1;
        const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        details = {
            '_id': newestId,
            'teacher_id': parseInt(req.body.teacher_id),
            'name': req.body.name,
            'monday_has_class': req.body.monday,
            'monday_class_time': req.body.monday_class,
            'tuesday_has_class': req.body.tuesday,
            'tuesday_class_time': req.body.tuesday_class,
            'wednesday_has_class': req.body.wednesday,
            'wednesday_class_time': req.body.wednesday_class,
            'thursday_has_class': req.body.thursday,
            'thursday_class_time': req.body.thursday_class,
            'friday_has_class': req.body.friday,
            'friday_class_time': req.body.friday_class,
            'saturday_has_class': req.body.saturday,
            'saturday_class_time': req.body.saturday_class,
            'sunday_has_class': req.body.sunday,
            'sunday_class_time': req.body.sunday_class,
            'created_date': createdDate,
            'is_active': 1
        }
        let newClass = await db.collection('class').insert(details);
        if (newClass) {
            return res.send({
                'type': 'success',
                'message': 'Class created'
            })
        } else {
            return res.send({
                'type': 'error',
                'message': 'Some errors occured'
            })
        }
        // console.log(highestId)
        // res.send(highestId.toString())
    }
    catch (err) {
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        });
    }
}

async function getClassById(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    }
    try {
        const details = {
            '_id': req.body.id,
            'is_active': 1
        };
        const result = await db.collection('class').findOne(details);
        if (result) {
            console.log(result);
            return res.send(result);
        }
    }
    catch(err) {
        return res.send('Error')
    }
}

async function changeClassData(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    }
    try {
        const updatedDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        let details = {
            "name": req.body.name,
            'is_active': 1
        }
        let classnameIsNotUnique = await db.collection('class').findOne(details);
        if (classnameIsNotUnique) {
            return res.send({
                'type': 'error',
                'message': 'The class name is taken'
            })
        }
        let updatedClass = await db.collection('class').update(
            {
                _id: parseInt(req.body.id),
                is_active: 1
            }, {
                $set: {
                    'teacher_id': parseInt(req.body.teacher_id),
                    'name': req.body.name,
                    'monday_has_class': req.body.monday,
                    'monday_class_time': req.body.monday_class,
                    'tuesday_has_class': req.body.tuesday,
                    'tuesday_class_time': req.body.tuesday_class,
                    'wednesday_has_class': req.body.wednesday,
                    'wednesday_class_time': req.body.wednesday_class,
                    'thursday_has_class': req.body.thursday,
                    'thursday_class_time': req.body.thursday_class,
                    'friday_has_class': req.body.friday,
                    'friday_class_time': req.body.friday_class,
                    'saturday_has_class': req.body.saturday,
                    'saturday_class_time': req.body.saturday_class,
                    'sunday_has_class': req.body.sunday,
                    'sunday_class_time': req.body.sunday_class,
                    'updated_date': updatedDate,
                }
            }
        );
        if (updatedClass) {
            return res.send({
                'type': 'success',
                'message': 'Class updated'
            })
        } else {
            return res.send({
                'type': 'error',
                'message': 'Some errors occured'
            })
        }
        // console.log(highestId)
        // res.send(highestId.toString())
    }
    catch (err) {
        console.log(err)
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        });
    }
}

async function deleteClass (req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    }
    try {
        const deletedDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        let deleteClass = await db.collection('class').update(
            {
                _id: req.body.id,
                is_active: 1
            }, {
                $set: {
                'is_active': 0,
                'deleted_date': deletedDate
                }
            }
        );
        if (deleteClass) {
            return res.send({
                'type': 'success',
                'message': 'Class deleted'
            })
        } else {

        }
    }
    catch(err) {
        console.log(err)
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        });
    }
}

async function addStudent (req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    }
    try {
        let details = {
            "username": req.body.username,
            'is_active': 1
        }
        let usernameIsNotUnique = await db.collection('user').findOne(details);
        if (usernameIsNotUnique) {
            return res.send({
                'type': 'error',
                'message': 'The username is taken'
            })
        }
        let highestId = await db.collection('user').find().sort([['_id', -1]]).limit(1).toArray();
        highestId = highestId[0]._id;
        const newestId = highestId + 1;
        const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        details = {
            '_id': newestId,
            'username': req.body.username,
            'role_id': 3,
            'password': Bcrypt.hashSync(req.body.password, salt),
            'created_date': createdDate,
            'is_active': 1
        };
        let newStudent = await db.collection('user').insert(details);
        if (newStudent) {
            return res.send({
                'type': 'success',
                'message': 'Student created'
            })
        } else {
            return res.send({
                'type': 'error',
                'message': 'Some errors occured'
            });
        }
    }
    catch(err) {
        console.log(err)
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        });
    }
}

async function addTeacher(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    }
    try {
        let details = {
            "username": req.body.username,
            'is_active': 1
        }
        let usernameIsNotUnique = await db.collection('user').findOne(details);
        if (usernameIsNotUnique) {
            return res.send({
                'type': 'error',
                'message': 'The username is taken'
            })
        }
        let highestId = await db.collection('user').find().sort([['_id', -1]]).limit(1).toArray();
        highestId = highestId[0]._id;
        const newestId = highestId + 1;
        const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        details = {
            '_id': newestId,
            'username': req.body.username,
            'role_id': 2,
            'password': Bcrypt.hashSync(req.body.password, salt),
            'created_date': createdDate,
            'is_active': 1
        };
        let newTeacher = await db.collection('user').insert(details);
        if (newTeacher) {
            return res.send({
                'type': 'success',
                'message': 'Teacher created'
            })
        } else {
            return res.send({
                'type': 'error',
                'message': 'Some errors occured'
            });
        }
    }
    catch (err) {
        console.log(err)
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        });
    }
}

module.exports = {
  register: register,
  login: login,
  authentication: authentication,
  changePassword: changePassword,
  googleRegister: googleRegister,
  facebookRegister: facebookRegister,
  googleUnbind: googleUnbind,
  facebookUnbind: facebookUnbind,
  googleLogin: googleLogin,
  facebookLogin: facebookLogin,
  checkPermission: checkPermission,
  getAllTeachers: getAllTeachers,
  deleteTeacher: deleteTeacher,
  getTeacherById: getTeacherById,
  changeTeacherData: changeTeacherData,
  getAllStudents: getAllStudents,
  deleteStudent: deleteStudent,
  getStudentById: getStudentById,
  changeStudentData: changeStudentData,
  getAllClasses: getAllClasses,
  addClass: addClass,
  getClassById: getClassById,
  changeClassData: changeClassData,
  deleteClass: deleteClass,
  addStudent: addStudent,
  addTeacher: addTeacher
};