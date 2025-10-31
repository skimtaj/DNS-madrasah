const express = require('express');
const route = express.Router();
const multer = require('multer');
const path = require('path');

const auth = require('../../middleware/adminAuth')

route.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));
const storage = multer.diskStorage({
    limits: { fileSize: 10000000 },
    destination: function (req, file, cb) {
        cb(null, './Uploads')
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
})

const upload = multer({ storage: storage })

const { excelStudent, resetPasswordPost, logout, forgetPassword, resetPassword, editFeesPost, editFees, deleteFees, feesList, addFeesPost, addFees, downloadApplication, editStudentPost, editStudent, stuentRegiPost, stuentRegi, paymentSS, viewStuent, studentList, downloadResult, deleteResult, insertResultPost, studentResult, insertResult, adminDashboard, adminLoginPost, adminCredential, adminSignupPost } = require('../../adminModule/controllers/admin_controllers')

route.get('/dnsmadrasah.org/admin-login', adminCredential);
route.post('/dnsmadrasah.org/admin-login', adminLoginPost)
route.post('/dnsmadrasah.org/admin-signup', adminSignupPost)

route.get('/dnsmadrasah.org/dns-admin', auth, adminDashboard);

route.get('/dnsmadrasah.org/dns-admin/student-list', auth, studentList);

route.get('/dnsmadrasah.org/dns-admin/view-student/:id', viewStuent);


route.get('/download-payment-ss/:id', paymentSS);

route.get('/dnsmadrasah.org/dns-admin/student-registration', auth, stuentRegi);

const uploadMiddleware = upload.fields([{ name: 'student_image', maxCount: 1 }, { name: 'paymentScreenshot', maxCount: 8 }])


route.post('/dnsmadrasah.org/dns-admin/student-registration', auth, uploadMiddleware, stuentRegiPost);

route.get('/dnsmadrasah.org/dns-admin/edit-student/:id', editStudent);

route.post('/dnsmadrasah.org/dns-admin/edit-student/:id', upload.single('student_image'), editStudentPost);

route.get('/download-application/:id', downloadApplication);

route.get('/dnsmadrasah.org/dns-admin/fees/add-fees', auth, addFees);

route.post('/dnsmadrasah.org/dns-admin/fees/add-fees', auth, addFeesPost);

route.get('/dnsmadrasah.org/dns-admin/fees-list', auth, feesList);

route.get('/delete-fees/:id', deleteFees);

route.get('/edit-fees/:id', editFees)
route.post('/edit-fees/:id', editFeesPost);

route.post('/dnsmadrasah.org/forgat-password', forgetPassword)

route.get('/dnsmadrasah.org/reset-password/:id', resetPassword);
route.post('/dnsmadrasah.org/reset-password/:id', resetPasswordPost);


route.get('/logout', logout);

route.get('/download-student-excel', auth, excelStudent)














module.exports = route;

