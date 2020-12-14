// var bcrypt = dcodeIO.bcrypt;
const Bcrypt = require('bcryptjs');
const { error } = require('console');
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
            let passwordChecker = Bcrypt.compareSync(req.body.password, user.password);
            console.log(passwordChecker, 'passwordChecker');
            if (passwordChecker) {
                dotenv.config();
                let token = jwt.sign({ 
                    username: req.body.username,
                    google: userGoogle,
                    facebook: userFacebook
                }, process.env.TOKEN_SECRET, {algorithm: 'HS384'}, { expiresIn: 72000 });
                return res.send({ 'message': 'successful authenticated!', 'token': token , 'username': req.body.username, 'google': userGoogle, 'facebook': userFacebook});
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
                    "password": user.password
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
            dotenv.config();
            let token = jwt.sign({
                username: user.username,
                google: userGoogle,
                facebook: userFacebook
            }, process.env.TOKEN_SECRET, { algorithm: 'HS384' }, { expiresIn: 72000 });
            if (token) {
                return res.send({ 'type': 'success','message': 'successful authenticated!', 'token': token, 'username': user.username, 'google': userGoogle, 'facebook': userFacebook });                
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
            dotenv.config();
            let token = jwt.sign({
                username: user.username,
                google: userGoogle,
                facebook: userFacebook
            }, process.env.TOKEN_SECRET, { algorithm: 'HS384' }, { expiresIn: 72000 });
            if (token) {
                return res.send({ 'type': 'success','message': 'successful authenticated!', 'token': token, 'username': user.username, 'google': userGoogle, 'facebook': userFacebook });
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
  facebookLogin: facebookLogin
};