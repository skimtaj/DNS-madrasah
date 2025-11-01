const admin_signup_model = require("../models/admin_signup_model");
const bcryptjs = require('bcryptjs');
const student_result_model = require("../models/student_result_model");
const path = require('path');
const student_regi = require("../../userModule/models/student_regi");
const nodemailer = require('nodemailer');
require('dotenv').config();

const qrcode = require('qrcode')
const { PDFDocument } = require('pdf-lib');
const fs = require('fs/promises');
const fees_model = require("../models/fees_model");

require('dotenv').config();
const exceljs = require('exceljs')


const adminCredential = (req, res) => {
    res.render('../adminModule/Views/admin_credential')

}

const adminSignupPost = async (req, res) => {

    try {

        const adminSignupData = req.body;

        const adminEmail = await admin_signup_model.findOne({ email: adminSignupData.email });
        const adminMobile = await admin_signup_model.findOne({ mobil: adminSignupData.mobile })

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;


        if (adminEmail) {
            req.flash('error', ' Email already exist');
            return res.redirect('/dnsmadrasah.org/admin-login')
        }

        if (adminMobile) {
            req.flash('error', 'Mobile number Already exist');
            return res.redirect('/dnsmadrasah.org/admin-login')
        }

        if (!emailRegex.test(adminSignupData.email)) {
            req.flash('error', 'Invalid email id');
            return res.redirect('/dnsmadrasah.org/admin-login');
        }

        if (!mobileRegex.test(adminSignupData.mobile)) {

            req.flash('error', 'Invalid mobile number');
            return res.redirect('/dnsmadrasah.org/admin-login')
        }

        const new_adminSignup_model = admin_signup_model(adminSignupData);
        await new_adminSignup_model.save();

        console.log(adminSignupData)
        req.flash('success', 'admin signup successfully');
        return res.redirect('/dnsmadrasah.org/admin-login')
    }

    catch (err) {

        console.log(err)

        req.flash('error', 'Something went wrong. Please try again later');
        return res.redirect('/dnsmadrasah.org/admin-login')
    }

}

const adminLoginPost = async (req, res) => {

    const { email, password } = req.body;
    const adminEmail = await admin_signup_model.findOne({ email: email });

    if (adminEmail) {

        const matchPassword = await bcryptjs.compare(password, adminEmail.password);

        if (matchPassword) {

            const token = await adminEmail.generateAdminToken();
            res.cookie('adminToken', token), {

                httpOnly: true,
                secure: true,
                maxAge: 365 * 24 * 60 * 60 * 1000,

            }

            req.flash('success', `Yo are welcome ${adminEmail.name}`);
            return res.redirect('/dnsmadrasah.org/dns-admin')
        }

        else {
            req.flash('error', 'Incorrcet email or password');
            return res.redirect('/dnsmadrasah.org/admin-login')
        }
    }

    else {
        req.flash('error', 'Invalid login details');
        return res.redirect('/dnsmadrasah.org/admin-login')
    }

}

const adminDashboard = async (req, res) => {

    const toltalStudents = await student_regi.countDocuments();

    const adminSourse = await admin_signup_model.findById(req.adminId)

    res.render('../adminModule/Views/admin_dashboard', { toltalStudents, adminSourse })

}

const insertResult = (req, res) => {

    res.render('../adminModule/Views/student_result_form')

}

const studentResult = async (req, res) => {

    const currentPage = parseInt(req.query.page) || 1;
    const limit = 5;
    const total = await student_result_model.countDocuments();
    const serialNo = (currentPage - 1) * limit;

    const allStudentResult = await student_result_model.find().skip((currentPage - 1) * limit).limit(limit).sort({ _id: -1 });

    res.render('../adminModule/Views/student_result', { serialNo, allStudentResult, currentPage: currentPage, previousPage: currentPage > 1, nextPage: currentPage * limit < total })
}

const insertResultPost = async (req, res) => {

    try {

        const studentResultInfo = req.body;
        studentResultInfo.marktSheetUplod = req.file.filename;
        const new_studentModel = student_result_model(studentResultInfo);
        await new_studentModel.save();

        console.log(studentResultInfo);
        req.flash('success', 'result inserted successfully');
        return res.redirect('/dnsmadrasah.org/dns-admin/student-result')
    }

    catch (error) {

        console.log('Result submission error', error)

        req.flash('error', 'Error saving result. Check input.');
        return res.redirect('/dnsmadrasah.org/dns-admin/student-result')
    }

}

const deleteResult = async (req, res) => {

    await student_result_model.findByIdAndDelete(req.params.id);
    req.flash('success', 'result deleted successfully');
    return res.redirect('/dnsmadrasah.org/dns-admin/student-result')

}

const downloadResult = async (req, res) => {

    const studentSourse = await student_result_model.findById(req.params.id);
    const resultPath = path.join(__dirname, '../../Uploads', studentSourse.marktSheetUplod);

    if (resultPath) {
        res.download(resultPath)
    }

    else {

        req.flash('error', 'Result is empty');
        return res.redirect('/dnsmadrasah.org/dns-admin/student-result')
    }
}

const studentList = async (req, res) => {


    const totalStudents = await student_regi.countDocuments();

    const allStudent = await student_regi.find().sort({ _id: -1 })

    res.render('../adminModule/Views/student_list', { allStudent, totalStudents })

}

const viewStuent = async (req, res) => {

    const studentSourse = await student_regi.findById(req.params.id)

    res.render('../adminModule/Views/view_student', { studentSourse })

}

const paymentSS = async (req, res) => {

    const studentSourse = await student_regi.findById(req.params.id);
    const paymentPath = path.join(__dirname, '../../Uploads', studentSourse.paymentScreenshot)

    if (paymentPath) {
        res.download(paymentPath)
    }

    else {

        req.flash('error', 'No file here');
        return res.redirect(`/dnsmadrasah.org/dns-admin/view-student/${studentSourse._id}`)
    }


}

const stuentRegi = (req, res) => {

    res.render('../adminModule/Views/admin_admission_form')
}

const stuentRegiPost = async (req, res) => {

    const studentRegiData = req.body;


    if (req.files['student_image']) {

        studentRegiData.student_image = req.files['student_image'][0].filename;
    }

    if (req.files['paymentScreenshot']) {

        studentRegiData.paymentScreenshot = req.files['paymentScreenshot'][0].filename
    }

    const mobileNoValid = /^(?:\+91[\-\s]?|0)?[6-9]\d{9}$/;
    const adhaarNovalid = /^\d{12}$/
    const bankNoValid = /^\d{9,18}$/;

    if (!mobileNoValid.test(studentRegiData.Mobile_No)) {
        req.flash('error', 'Invalid Mobile Number');
        return res.redirect('/dnsmadrasah.org/student-registration')
    }

    if (!adhaarNovalid.test(studentRegiData.Aadhaar_Number)) {
        req.flash('error', 'Invalid Adhaar Number');
        return res.redirect('/dnsmadrasah.org/student-registration')
    }

    if (!bankNoValid.test(studentRegiData.bank_ac_no)) {
        req.flash('error', 'Invalid Bank Account Number');
        return res.redirect('/dnsmadrasah.org/student-registration')
    }


    const serialNo = async () => {

        const currentYear = new Date().getFullYear();
        const totalRegistration = await student_regi.countDocuments();
        const incretotalRegistration = totalRegistration + 1;

        const incretotalRegistrationString = String(incretotalRegistration).padStart(4, '0')

        return `DNS-${currentYear}-${incretotalRegistrationString}`
    };

    studentRegiData.serial_no = await serialNo();


    const today = new Date().toISOString().split('T')[0];

    studentRegiData.application_date = today;

    studentRegiData.payment_Status = 'Paid'

    const new_student_regi = student_regi(studentRegiData);
    await new_student_regi.save();


    const allAdmins = await admin_signup_model.find();

    const adminEmail = await allAdmins.map((a) => a.email);

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



    console.log(new_student_regi);

    req.flash('success', 'Student registration completed successfully');
    return res.redirect('/dnsmadrasah.org/dns-admin/student-list')
}

const editStudent = async (req, res) => {

    const studentSourse = await student_regi.findById(req.params.id)

    res.render('../adminModule/Views/edit_student', { studentSourse })
}

const editStudentPost = async (req, res) => {

    const editStudentInfo = req.body;

    if (req.file) {

        editStudentInfo.student_image = req.file.filename

    }

    await student_regi.findByIdAndUpdate(req.params.id, editStudentInfo);

    req.flash('success', 'Student info updated successfully');
    return res.redirect('/dnsmadrasah.org/dns-admin/student-list')
}

const downloadApplication = async (req, res) => {

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
            x: 450,
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

    }

    catch (err) {

        console.log('This is pdf generating error', err);
        req.flash('error', 'Pdf generating error');
        return res.redirect('/dnsmadrasah.org/dns-admin/student-list')
    }


}

const addFees = (req, res) => {

    res.render('../adminModule/Views/fees_form')

}

const addFeesPost = async (req, res) => {

    const feesData = req.body;
    const new_fees_model = fees_model(feesData);
    await new_fees_model.save();

    console.log(feesData);

    res.send('fees added successfully')


}

const feesList = async (req, res) => {


    const allFees = await fees_model.find();

    res.render('../adminModule/Views/fees_list', { allFees })

}

const deleteFees = async (req, res) => {

    await fees_model.findByIdAndDelete(req.params.id);

    req.flash('success', 'fees deleted successfuly');
    return res.redirect('/dnsmadrasah.org/dns-admin/fees-list')

}

const editFees = async (req, res) => {

    const feesSourse = await fees_model.findById(req.params.id)

    res.render('../adminModule/Views/edit_fees', { feesSourse })

}

const editFeesPost = async (req, res) => {

    const editFeesData = req.body;
    await fees_model.findByIdAndUpdate(req.params.id, editFeesData);

    req.flash('success', 'Fees updated successfully');
    return res.redirect('/dnsmadrasah.org/dns-admin/fees-list')

}

const resetPassword = async (req, res) => {

    const adminSourse = await admin_signup_model.findById(req.params.id)

    res.render('../adminModule/Views/reset_password', { adminSourse })

}

const forgetPassword = async (req, res) => {

    const { email } = req.body;

    console.log(email)

    const matchEmail = await admin_signup_model.findOne({ email: email })

    if (matchEmail) {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User,
                pass: process.env.Pass
            }
        });

        let mailOptions = {
            from: process.env.User,
            to: matchEmail.email,
            subject: 'Reset Password - DNS Madrasah',
            text: `Click the link below to reset your DNS Madrasah account password: \nhttps://dns-madrasah.onrender.com/dnsmadrasah.org/reset-password/${matchEmail._id} `
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        req.flash('success', 'Please check your email');
        return res.redirect('/dnsmadrasah.org/admin-login')

    }

    else {
        req.flash('error', 'No account found with this email address.');
        return res.redirect('/dnsmadrasah.org/admin-login')

    }

}

const logout = (req, res,) => {

    res.clearCookie('adminToken');
    req.flash('success', 'You are successfully logout');
    return res.redirect('/dnsmadrasah.org/admin-login')

}

const resetPasswordPost = async (req, res) => {

    const { newPassword } = req.body;

    const adminSourse = await admin_signup_model.findById(req.params.id);

    adminSourse.password = newPassword;

    await adminSourse.save();

    req.flash('success', 'Your password has been updated successfully');
    return res.redirect('/dnsmadrasah.org/admin-login')

}


const excelStudent = async (req, res) => {

    const allStudents = await student_regi.find();
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('allStudents');

    const headerRow = worksheet.addRow(['Serial No', 'student_name', 'applied_class', 'dob', 'age', 'Bangla_Shiksha_Portal', 'nationality', 'Village', 'post', 'ps', 'Dist', 'PIN_Code', 'Guardian_Name', 'Relation_with_Student', 'occupation', 'Mobile_No', 'WhatsApp_No', 'Aadhaar_Number', 'bank_ac_no', 'ifsc_code', 'regi_fees', 'paymentScreenshot', 'admission_Status', 'admission_mode', 'application_date', 'payment_Status'])


    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '00A884' } // Green background (#00A884)
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
    });

    allStudents.forEach((s) => {

        worksheet.addRow([
            s.serial_no,
            s.student_name,
            s.applied_class,
            s.dob,
            s.age,
            s.Bangla_Shiksha_Portal,
            s.nationality,
            s.Village,
            s.post,
            s.ps,
            s.District,
            s.PIN_Code,
            s.Guardian_Name,
            s.Relation_with_Student,
            s.occupation,
            s.Mobile_No,
            s.WhatsApp_No,
            s.Aadhaar_Number,
            s.bank_ac_no,
            s.ifsc_code,
            s.regi_fees,
            s.paymentScreenshot,
            s.admission_Status,
            s.admission_mode,
            s.application_date,
            s.payment_Status,

        ]);
    })

    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");
    await workbook.xlsx.write(res);
    res.end();

}

const deleteStudent = async (req, res) => {

    await student_regi.findByIdAndDelete(req.params.id);
    req.flash('success', 'Student deleted successfully');
    return res.redirect('/dnsmadrasah.org/dns-admin/student-list')
}

module.exports = { deleteStudent, excelStudent, resetPasswordPost, logout, forgetPassword, resetPassword, editFeesPost, editFees, deleteFees, feesList, addFeesPost, addFees, downloadApplication, editStudentPost, editStudent, stuentRegiPost, stuentRegi, paymentSS, viewStuent, studentList, downloadResult, deleteResult, insertResultPost, studentResult, insertResult, adminDashboard, adminLoginPost, adminCredential, adminSignupPost };