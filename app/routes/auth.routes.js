var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db, controllers) {
    app.get('/api', (req, res) => {
        // You'll create your note here.    
        res.send('Welcome to server')
    });
    app.post('/api/register', async (req, res) => await controllers.register(req,res,db));
    app.post('/api/login', async(req, res) => await controllers.login(req,res,db));
    app.post('/api/authentication', async(req, res) => await controllers.authentication(req,res,db));
    app.post('/api/password/change', async(req, res) => await controllers.changePassword(req,res,db));
    app.post('/api/google/register', async (req, res) => await controllers.googleRegister(req, res, db));
    app.post('/api/facebook/register', async (req, res) => await controllers.facebookRegister(req, res, db));
    app.post('/api/google/unbind', async (req, res) => await controllers.googleUnbind(req, res, db));
    app.post('/api/facebook/unbind', async (req, res) => await controllers.facebookUnbind(req, res, db));
    app.post('/api/google/login', async (req, res) => await controllers.googleLogin(req, res, db));
    app.post('/api/facebook/login', async (req, res) => await controllers.facebookLogin(req, res, db));
    app.post('/api/permission/check', async (req, res) => await controllers.checkPermission(req, res, db));
    app.post('/api/teachers/list', async (req, res) => await controllers.getAllTeachers(req, res, db));
    app.post('/api/teachers/delete', async (req, res) => await controllers.deleteTeacher(req, res, db));
    app.post('/api/teachers/id', async (req, res) => await controllers.getTeacherById(req, res, db));
    app.post('/api/teachers/add', async (req, res) => await controllers.addTeacher(req, res, db));
    app.post('/api/teachers/data/change', async (req, res) => await controllers.changeTeacherData(req, res, db));    
    app.post('/api/students/list', async (req, res) => await controllers.getAllStudents(req, res, db));
    app.post('/api/students/delete', async (req, res) => await controllers.deleteStudent(req, res, db));
    app.post('/api/students/id', async (req, res) => await controllers.getStudentById(req, res, db));
    app.post('/api/students/add', async (req, res) => await controllers.addStudent(req, res, db));
    app.post('/api/students/data/change', async (req, res) => await controllers.changeStudentData(req, res, db));   
    app.post('/api/classes/list', async (req, res) => await controllers.getAllClasses(req, res, db))
    app.post('/api/classes/add', async (req, res) => await controllers.addClass(req, res, db))
    app.post('/api/classes/id', async (req, res) => await controllers.getClassById(req, res, db))
    app.post('/api/classes/data/change', async (req, res) => await controllers.changeClassData(req, res, db))
    app.post('/api/classes/delete', async (req, res) => await controllers.deleteClass(req, res, db))
    app.post('/api/classes/name', async (req, res) => await controllers.getAllClassesName(req, res, db))
    app.post('/api/classes/students', async (req, res) => await controllers.getClassInfo(req, res, db))
    app.post('/api/classes/students/change', async (req, res) => await controllers.changeClassStudentStatus(req, res, db))
    app.post('/api/payment', async (req, res) => await controllers.getAllUserPayment(req, res, db))
    app.post('/api/payment/user', async (req, res) => await controllers.getPaymentByUser(req, res, db))
    app.post('/api/payment/change', async (req, res) => await controllers.changePaymentAmount(req, res, db))
    app.post('/api/payment/students/log', async (req, res) => await controllers.getStudentPaymentLog(req, res, db))
    app.post('/api/payment/students/add', async (req, res) => await controllers.addStudentPayment(req, res, db))
    app.post('/api/payment/all', async (req, res) => await controllers.getAllPayments(req, res, db))
};