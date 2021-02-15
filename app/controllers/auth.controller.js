// var bcrypt = dcodeIO.bcrypt;
const Bcrypt = require('bcryptjs');
const { error } = require('console');
const moment = require('moment');
/** One way, can't decrypt but can compare */
var salt = 10;

const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { type } = require('os');


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
                    'type': 'error',
                    'message': 'This user is blocked!'
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
                    'type': 'success', 
                    'message': 'successful authenticated!', 
                    'token': token, 
                    'username': req.body.username, 
                    'google': userGoogle, 
                    'facebook': userFacebook,
                    'permissions': await checkPermission(req, res, db, token)
                });
            } else {
                return res.send({'type': 'error', 'message': 'Wrong password'});
            }
        } else {
            return res.send({ 'type ': 'error', 'message': 'Wrong username' });
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
                await db.collection('class_user_payment').update(
                    {
                        student_id: req.body.id
                    }, {
                        $set: {
                            'is_active': 0,
                            'deleted_date': deletedDate
                        }
                    }
                )
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
        console.log(roleId);
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    }
    let details = {}
    if (+roleId === 2) {
        let userId = await db.collection('user').findOne({
            'username': username
        })
        userId = userId._id;
        console.log(userId)
        details = {
            'teacher_id': +userId,
            'is_active': 1
        }
    } else {
        details = {
            'teacher_id': req.body.teacher,
            'is_active': 1
        }
    }
    try {
        let classes = await db.collection('class').find(details).toArray();
        let classesId = [];
        classes.forEach(v => {
            classesId.push(v._id);
        });
        let classStudents = [];
        for (const classId of classesId) {
            let obj = {
                'class_id': classId,
                'is_active': 1,
                'user_is_active': 1
            }
            let classSelected = await db.collection('user_class').find(obj).toArray();
            classSelected.forEach(v => {
                classStudents.push(v)
            })
        }
        let students = [];
        for (const student of classStudents) {
            let details = {
                '_id': student.student_id,
                'role_id': 3
            };
            let studentSelected = await db.collection('user').findOne(details);
            students.push(studentSelected);
        }
        let classUser = [];
        for (let i = 0; i < classStudents.length; i++) {
            let obj = {
                'username': students[i].username,
                'class_id': classStudents[i].class_id,
                'student_id': classStudents[i].student_id
            }
            classUser.push(obj)
        }
        return res.send({
            classes,
            classStudents,
            students,
            classUser
        })
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
        let newestId = '';
        if (highestId.length === 0) {
            newestId = 1;
        } else {
            highestId = highestId[0]._id;
            newestId = highestId + 1;
        }
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
        let newestId = '';
        if (highestId.length === 0) {
            newestId = 1;
        } else {
            highestId = highestId[0]._id;
            newestId = highestId + 1;
        }
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
            let highestPaymentId = await db.collection('class_user_payment').find().sort([['_id', -1]]).limit(1).toArray();
            highestPaymentId = highestPaymentId[0]._id;
            const newestPaymentId = highestPaymentId + 1;
            details = {
                '_id': newestPaymentId,
                'student_id': newestId,
                'amount': 0,
                'created_date': createdDate,
                'is_active': 1
            };
            let amountInserted = await db.collection('class_user_payment').insert(details);
            if (amountInserted) {
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
        let newestId = '';
        if (highestId.length === 0) {
            newestId = 1;
        } else {
            highestId = highestId[0]._id;
            newestId = highestId + 1;
        }
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

async function getClassInfo (req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    };
    try {
        let highestId = await db.collection('user_class').find().sort([['_id', -1]]).limit(1).toArray();
        let newestId = '';
        if (highestId.length === 0) {
            newestId = 1;
        } else {
            highestId = highestId[0]._id;
            newestId = highestId + 1;
        }
        console.log(newestId, 'newestId');
        let details = {
            'role_id': 3,
            'is_active': 1
        }
        let students = await db.collection('user').find(details).toArray();
        details = {
            'class_id': parseInt(req.body.class),
            'is_active': 1,
            'user_is_active': 1
        }
        let selectedClass = await db.collection('user_class').find(details).toArray();
        let studentsId = [];
        selectedClass.forEach(v => { studentsId.push(v.student_id)});
        const selectedStudents = students.filter((s) => {
            return studentsId.includes(s._id);
        })
        const availableStudents = students.filter((s) => {
            return !studentsId.includes(s._id);

        })
        console.log(selectedStudents);
        details = {
            '_id': req.body.class
        }
        const teacher = await db.collection('class').findOne(details);
        const teacherId = teacher._id;
        console.log(teacherId);
        return res.send({
            selectedStudents,
            availableStudents,
            teacherId,
            newestId
        })
    }
    catch (err) {
        console.log(err)
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        });
    }
}

async function changeClassStudentStatus(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    };
    try {
        let success = true;
        const availableStudents = req.body.availableStudents;
        const selectedStudents = req.body.selectedStudents;
        if ( availableStudents.length !== 0) {
            let index = 0;
            availableStudents.forEach(async(student) => {
                let details = {
                    'student_id': student._id,
                    'class_id': req.body.class
                };
                const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');
                let userCreated = await db.collection('user_class').findOne(details);
                if (userCreated) {
                    // console.log(userCreated);
                    let userUpdated = await db.collection('user_class').update(
                        {
                            'student_id': student._id,
                            'class_id': req.body.class,
                            'is_active': 1,
                            'user_is_active': 0
                        },
                        {
                            $set: {
                                'user_is_active': 1,
                                'updated_date': createdDate
                            }
                        }
                    )
                    let paymentCreated = await db.collection('class_user_payment').findOne({
                        'is_active': 0,
                        'student_id': student._id,
                        'class_id': req.body.class
                    })
                    if (paymentCreated) {
                        await db.collection('class_user_payment').update(
                            {
                                'is_active': 0,
                                'student_id': student._id,
                                'class_id': req.body.class
                            }, 
                            {
                                $set: {
                                    'is_active': 1
                                }
                            }
                        );
                    } 
                    if (userUpdated.result.n === 1 && userUpdated.result.nModified === 1 && userUpdated.result.ok === 1) {
                        success = true;
                    } else {
                        success = false;
                    }
                }
                else {
                    details = {
                        '_id': req.body.id[index],
                        'student_id': student._id,
                        'class_id': req.body.class,
                        'created_date': createdDate,
                        'is_active': 1,
                        'user_is_active': 1
                    }
                    index++;
                    let userAdded = await db.collection('user_class').insert(details);
                    let highestId = await db.collection('class_user_payment').find().sort([['_id', -1]]).limit(1).toArray();
                    let paymentId = '';
                    if (highestId.length === 0) {
                        paymentId = 1;
                    } else {
                        highestId = highestId[0]._id;
                        paymentId = highestId + 1;
                    }
                    details = {
                        '_id': paymentId,
                        'student_id': student._id,
                        'amount': 0,
                        'class_id': req.body.class,
                        'created_date': createdDate,
                        'is_active': 1,
                    }
                    let paymentAdded = await db.collection('class_user_payment').insert(details);
                    highestId = await db.collection('student_payment_log').find().sort([['_id', -1]]).limit(1).toArray();
                    highestId = highestId[0]._id;
                    const paymentLogId = highestId + 1;
                    details = {
                        '_id': paymentLogId,
                        'payment_id': paymentId,
                        'payments': [],
                        'created_date': createdDate,
                        'is_active': 1,
                    }
                    let paymentLogAdded = await db.collection('student_payment_log').insert(details);
                    if (userAdded) {
                        success = true;
                    } else {
                        success = false;
                    }
                }
            })
        }
        if (selectedStudents.length !== 0) {
            selectedStudents.forEach(async (student) => {
                let details = {
                    'student_id': student._id,
                    'class_id': req.body.class
                };
                const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');
                let userCreated = db.collection('user_class').findOne(details);
                if (userCreated) {
                    let userUpdated = await db.collection('user_class').update(
                        {
                            'student_id': student._id,
                            'class_id': req.body.class,
                            'user_is_active': 1
                        },
                        {
                            $set: {
                                'user_is_active': 0,
                                'deleted_date': createdDate
                            }
                        }
                    )
                    console.log('THE PROBLEM IS THIS!!!')
                    let paymentUpdated = await db.collection('class_user_payment').update(
                        {
                            'is_active': 1,
                            'student_id': student._id,
                            'class_id': req.body.class,
                        },
                        {
                            $set: {
                                'is_active': 0,
                                'deleted_date': createdDate
                            }
                        }
                    );
                    let payment = await db.collection('class_user_payment').findOne({
                        'is_active': 0,
                        'student_id': student._id,
                        'class_id': req.body.class,
                    });
                    let paymentLogUpdated = await db.collection('student_payment_log').update(
                        {
                            'is_active': 1,
                            'payment_id': payment._id
                        }, 
                        {
                            $set: {
                                'is_active': 0,
                                'deleted_date': createdDate
                            }
                        }
                    );
                    if (userUpdated.result.n === 1 && userUpdated.result.nModified === 1 && userUpdated.result.ok === 1) {
                        success = true;
                    } else {
                        success = false;
                    }
                }
            })
        }
        if (success === true) {
            return res.send({
                'success': true,
                'message': 'Users updated'
            })
        } else {
            return res.send({
                'success': false,
                'message': 'Some errors occured'
            })
        }
    }
    catch (err) {
        console.log(err)
        return res.send({
            'success': false,
            'message': 'Some errors occured'
        });
    }
}

async function getAllUserPayment(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    };
    try {
        let details = {
            'is_active': 1
        }
        let userPayment = await db.collection('class_user_payment').find(details).toArray();
        return res.send({
            userPayment
        })
    }
    catch (err) {
        console.log(err)
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        });
    }
}

async function changePaymentAmount(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    };
    try {
        const createdDate = moment().format('YYYY-MM-DD, HH:mm:ss');
        let amountUpdated = await db.collection('class_user_payment').update(
            {
                '_id': req.body.id
            },
            {
                $set: {
                    'last_amount': req.body.lastAmount,
                    'amount': req.body.newAmount,
                    'updated_date': createdDate
                }
            }
        )
        if (amountUpdated.result.n === 1 && amountUpdated.result.nModified === 1 && amountUpdated.result.ok === 1) {
            return res.send({
                'type': 'success',
                'message': 'User updated'
            })
        } else {
            return res.send({
                'type': 'error',
                'message': 'Some errors occured'
            });
        }
    } catch (err) {
        console.log(err)
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        });
    }
}

async function getAllClassesName(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    };
    try {
        let classes = await db.collection('class').find({is_active: 1}).toArray();
        return res.send({
            classes
        })
    }
    catch(err) {
        console.log(err)
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        });
    }
}

async function getPaymentByUser(req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    };
    try {
        console.log(req.body.student);
        let details = {
            'student_id': req.body.student,
            'is_active': 1
        }
        let payments = await db.collection('class_user_payment').find(details).toArray();
        // console.log(payments);
        if (payments) {
            return res.send({payments});
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

async function getStudentPaymentLog (req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    };
    try {
        let studentPaymentLog = [];
        let payments = req.body.payments;
        // console.log(payments);
        for (let i = 0; i < payments.length; i++) {
            let details = {
                'payment_id': payments[i],
                'is_active': 1
            }
            let selectedLog = await db.collection('student_payment_log').findOne(details);
            // console.log(selectedLog);
            studentPaymentLog.push(selectedLog);
            if (i === payments.length - 1) {
                return res.send({
                    studentPaymentLog
                })
            }
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

async function addStudentPayment (req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    };
    try {
        let updatePaymentLog = await db.collection('student_payment_log').update(
            {
                _id: req.body.id,
                is_active: 1
            }, {
                $push: {
                    payments: {
                        payment_amount: req.body.amount,
                        payment_date: req.body.date,
                        payment_for: req.body.desc,
                        created_date: moment().format('YYYY-MM-DD, HH:mm:ss')
                    }
                }
            }
        )
        if (updatePaymentLog) {
            return res.send({
                'type': 'success',
                'message': 'Payment added successfully'
            })
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

async function getAllPayments (req, res, db) {
    let token = req.headers.authorization.split('Bearer ').pop();
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let roleId = decoded.role_id;
    if (+roleId !== 1 && +roleId !== 2) {
        return res.send({
            'message': 'Access forbiden',
            'role': roleId
        });
    };
    let teacherId;
    try {
        if (+roleId === 2) {
            let teacher = await db.collection('user').findOne({
                'username': decoded.username
            });
            teacherId = teacher._id
        }
        const details = {
            is_active: 1
        };
        let classes = await db.collection('class').find(details).toArray();
        let classUserPayment = await db.collection('class_user_payment').find(details).toArray();
        let studentPaymentLog = await db.collection('student_payment_log').find(details).toArray();
        return res.send({
            'roleId': roleId,
            'teacher': teacherId,
            'classes': classes, 
            'classUserPayment': classUserPayment, 
            'studentPaymentLog': studentPaymentLog
        })
    }
    catch (err) {
        console.log(err)
        return res.send({
            'type': 'error',
            'message': 'Some errors occured'
        });
    }
    find({})
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
    addTeacher: addTeacher,
    getClassInfo: getClassInfo,
    changeClassStudentStatus: changeClassStudentStatus,
    getAllUserPayment: getAllUserPayment,
    changePaymentAmount: changePaymentAmount,
    getAllClassesName: getAllClassesName,
    getPaymentByUser: getPaymentByUser,
    getStudentPaymentLog: getStudentPaymentLog,
    addStudentPayment: addStudentPayment,
    getAllPayments: getAllPayments
};