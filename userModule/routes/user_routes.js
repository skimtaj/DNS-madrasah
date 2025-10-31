const express = require('express');
const route = express.Router();
const multer = require('multer');
const path = require('path');

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




const { downloadStudenApplication, studentApplication, studentRegiPost, studentRegi, downloadResult, resultCheckPost, resultCheck, homePage, studentResult } = require('../../userModule/controllers/user_controllers')


route.get('/dnsmadrasah.org', homePage);

route.get('/dnsmadrasah.org/student-result/:resultId', studentResult);

route.get('/dnsmadrasah.org/result-check', resultCheck)
route.post('/dnsmadrasah.org/result-check', resultCheckPost);

route.get('/download-result/:resultId', downloadResult);

route.get('/dnsmadrasah.org/student-registration', studentRegi)

const uploadMiddleware = upload.fields([{ name: 'student_image', maxCount: 1 }, { name: 'paymentScreenshot', maxCount: 8 }])

route.post('/dnsmadrasah.org/student-registration', uploadMiddleware, studentRegiPost);

route.get('/dnsmadrasah.org/students-application/:id', studentApplication);

route.get('/download-student-application/:id', downloadStudenApplication)



module.exports = route
