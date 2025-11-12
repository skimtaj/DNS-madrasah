const student_result_model = require("../../adminModule/models/student_result_model");
const path = require('path');
const student_regi = require("../models/student_regi");
const admin_signup_model = require('../../adminModule/models/admin_signup_model');
const nodemailer = require('nodemailer');
require('dotenv').config();
const qrcode = require('qrcode');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs/promises');


const homePage = (req, res) => {

    res.render('../userModule/Views/home_page')

}

const studentResult = async (req, res) => {

    const studentResultSourse = await student_result_model.findById(req.params.resultId)

    res.render('../userModule/Views/view_result', { studentResultSourse })

}

const resultCheck = (req, res) => {

    res.render('../userModule/Views/check_result_form')

}

const resultCheckPost = async (req, res) => {

    const { student_class, roll_number, student_portal_no } = req.body;

    const studntClass = await student_result_model.findOne({ student_class: student_class.trim() });

    if (studntClass) {

        const studentRollNo = await student_result_model.findOne({ roll_number: roll_number.trim() });

        if (studentRollNo) {
            const studentPortalNo = await student_result_model.findOne({ student_portal_no: student_portal_no.trim() })

            if (studentPortalNo) {
                return res.redirect(`/dnsmadrasah.org/student-result/${studentPortalNo._id}`)
            }

            else {
                req.flash('error', 'incorrcet Portal id');
                return res.redirect('/dnsmadrasah.org/result-check')
            }
        }

        else {
            req.flash('error', 'incorrcet Roll No');
            return res.redirect('/dnsmadrasah.org/result-check')
        }
    }

    else {
        req.flash('error', 'Incorrcet class');
        return res.redirect('/dnsmadrasah.org/result-check')
    }

}

const downloadResult = async (req, res) => {

    const resultSourse = await student_result_model.findById(req.params.resultId);
    const resultPath = path.join(__dirname, '../../Uploads', resultSourse.marktSheetUplod)

    if (resultPath) {
        res.download(resultPath)
    }

    else {
        req.flash('error', 'result not found');
        return res.redirect(`/dnsmadrasah.org/student-result/${resultSourse._id}`)
    }

}

const studentRegi = async (req, res) => {


    res.render('../userModule/Views/srudent_registration')

}

const studentRegiPost = async (req, res) => {

    try {

        const studentRegidata = req.body;

        studentRegidata.payment_Status = 'Paid'

        const serialNo = async () => {

            const currentYear = new Date().getFullYear();
            const totalRegistration = await student_regi.countDocuments();
            const incretotalRegistration = totalRegistration + 1;

            const incretotalRegistrationString = String(incretotalRegistration).padStart(4, '0')

            return `DNS-${currentYear}-${incretotalRegistrationString}`
        };

        studentRegidata.serial_no = await serialNo();


        const today = new Date().toISOString().split('T')[0];

        studentRegidata.application_date = today;



        const mobileNoValid = /^(?:\+91[\-\s]?|0)?[6-9]\d{9}$/;
        const adhaarNovalid = /^\d{12}$/
        const bankNoValid = /^\d{9,18}$/;

        if (!mobileNoValid.test(studentRegidata.Mobile_No)) {
            req.flash('error', 'Invalid Mobile Number');
            return res.redirect('/dnsmadrasah.org/student-registration')
        }

        if (!adhaarNovalid.test(studentRegidata.Aadhaar_Number)) {
            req.flash('error', 'Invalid Adhaar Number');
            return res.redirect('/dnsmadrasah.org/student-registration')
        }

        if (!bankNoValid.test(studentRegidata.bank_ac_no)) {
            req.flash('error', 'Invalid Bank Account Number');
            return res.redirect('/dnsmadrasah.org/student-registration')
        }

        if (req.files['student_image']) {
            studentRegidata.student_image = req.files['student_image'][0].filename
        }

        if (req.files['paymentScreenshot']) {
            studentRegidata.paymentScreenshot = req.files['paymentScreenshot'][0].filename;
        }

        const new_student_regi = student_regi(studentRegidata);
        await new_student_regi.save();

        const admins = await admin_signup_model.find();

        const adminEmail = await admins.map((a) => a.email.split(','))

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User,
                pass: process.env.Pass
            }
        });

        let mailOptions = {
            from: process.env.User,
            to: adminEmail,
            subject: '',
            text: `Hello Admin, \nA new student has applied for admission for the year 2026.\nPlease check the details. \n`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        console.log(studentRegidata);

        req.flash('success', 'Student registration completed successfully');
        return res.redirect(`/dnsmadrasah.org/students-application/${new_student_regi._id}`)
    }

    catch (err) {

        console.log('This is student registration error', err)
        req.flash('error', 'Registration failed. Please try again');
        return res.redirect('/dnsmadrasah.org/student-registration')
    }

}

const studentApplication = async (req, res) => {

    const studentSourse = await student_regi.findById(req.params.id)

    res.render('../userModule/Views/student_application', { studentSourse })
}

const downloadStudenApplication = async (req, res) => {

    try {

        const studentSourse = await student_regi.findById(req.params.id);
        const inputPdfPath = path.join(__dirname, '../../Aplication_format/Registration-2026 (DNS) (1).pdf');
        const existingPdfBytes = await fs.readFile(inputPdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        form.getTextField('serial_no').setText(studentSourse.serial_no || '');
        form.getTextField('applied_class').setText(studentSourse.applied_class || '');
        form.getTextField('dob').setText(studentSourse.dob || '');

        form.getTextField('student_name').setText(studentSourse.student_name || '');
        form.getTextField('Bangla_Shiksha_Portal').setText(studentSourse.Bangla_Shiksha_Portal || '');
        form.getTextField('District').setText(studentSourse.District || '');

        form.getTextField('nationality').setText(studentSourse.nationality || '');
        form.getTextField('Village').setText(studentSourse.Village || '');
        form.getTextField('post').setText(studentSourse.post || '');
        form.getTextField('ps').setText(studentSourse.ps || '');
        form.getTextField('PIN_Code').setText(studentSourse.PIN_Code || '');
        form.getTextField('Guardian_Name').setText(studentSourse.Guardian_Name || '');

        form.getTextField('Relation_with_Student').setText(studentSourse.Relation_with_Student || '');
        form.getTextField('occupation').setText(studentSourse.occupation || '');
        form.getTextField('Mobile_No').setText(studentSourse.Mobile_No || '');
        form.getTextField('WhatsApp_No').setText(studentSourse.WhatsApp_No || '');
        form.getTextField('Aadhaar_Number').setText(studentSourse.Aadhaar_Number || '');
        form.getTextField('bank_ac_no').setText(studentSourse.bank_ac_no || '');
        form.getTextField('ifsc_code').setText(studentSourse.ifsc_code || '');
        form.getTextField('regi_fees').setText(studentSourse.regi_fees.toString() || '');
        form.getTextField('admission_mode').setText(studentSourse.admission_mode || '');
        form.getTextField('payment_Status').setText(studentSourse.payment_Status || '');
        form.getTextField('application_date').setText(studentSourse.application_date || '');

        const firstPage = pdfDoc.getPage(0);

        const imagePath = path.join(__dirname, '../../Uploads', studentSourse.student_image);
        const imageBytes = await fs.readFile(imagePath);
        const fileExtension = path.extname(studentSourse.student_image).toLowerCase();
        let image;

        if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
            image = await pdfDoc.embedJpg(imageBytes);
        } else if (fileExtension === '.png') {
            image = await pdfDoc.embedPng(imageBytes);
        }

        firstPage.drawImage(image, {
            x: 150,
            y: 700,
            width: 80,
            height: 80,
        });


        const qrcodeGenerat = (text) => {

            return qrcode.toBuffer(text, { type: 'png' })

        }

        const qrcodeContent = `
Serial No: ${studentSourse.serial_no}
Student Name: ${studentSourse.student_name}
Applied Class: ${studentSourse.applied_class}
Date of Birth: ${studentSourse.dob}
Age: ${studentSourse.age}
Bangla Shiksha Portal: ${studentSourse.Bangla_Shiksha_Portal}
Nationality: ${studentSourse.nationality}
Village: ${studentSourse.Village}
Post: ${studentSourse.post}
Police Station: ${studentSourse.ps}
District: ${studentSourse.District}
PIN Code: ${studentSourse.PIN_Code}
Guardian Name: ${studentSourse.Guardian_Name}
Relation with Student: ${studentSourse.Relation_with_Student}
Occupation: ${studentSourse.occupation}
Mobile No: ${studentSourse.Mobile_No}
WhatsApp No: ${studentSourse.WhatsApp_No}
Aadhaar Number: ${studentSourse.Aadhaar_Number}
Bank A/C No: ${studentSourse.bank_ac_no}
IFSC Code: ${studentSourse.ifsc_code}
Registration Fees: ${studentSourse.regi_fees}
Admission Mode: ${studentSourse.admission_mode}
Payment Status: ${studentSourse.payment_Status}
Application Date: ${studentSourse.application_date}
`;


        const qrcodeWithContent = await qrcodeGenerat(qrcodeContent);

        const embedImage = await pdfDoc.embedPng(qrcodeWithContent);
        firstPage.drawImage(embedImage, { x: 257, y: 150, width: 100, height: 100 })

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Student_Application.pdf"');
        res.end(pdfBytes);

        return res.redirect('/dnsmadrasah.org/student-registration')

    }

    catch (err) {

        console.log('This is Student pdf generating error', err)

    }

}

module.exports = { downloadStudenApplication, studentApplication, studentRegiPost, studentRegi, downloadResult, resultCheckPost, resultCheck, studentResult, homePage }