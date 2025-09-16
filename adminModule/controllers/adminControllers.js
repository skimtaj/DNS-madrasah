const bcryptjs = require("bcryptjs");
const admin_signup_model = require("../models/admin_signup_model");
const booking_model = require("../../userModule/models/booking_model");
const nodemailer = require('nodemailer');
const service_model = require("../models/service_model");
const bill_model = require("../models/bill_model");
require('dotenv').config();
const path = require('path');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const fs = require('fs/promises');

const express = require('express');
const app = express();
const session = require('express-session');

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

require('dotenv').config();




const adminLogin = (req, res) => {

    res.render('../adminModule/Views/admin_credential')

};

const adminSignupPost = async (req, res) => {

    const adminSignupdata = req.body;
    const new_admin_model = admin_signup_model(adminSignupdata);
    await new_admin_model.save();

    console.log(adminSignupdata)

    req.flash('success', 'Admin signup successfully');
    return res.redirect('/coolmate/admin-login')

}

const adminLoginPost = async (req, res) => {

    const { email, password } = req.body;

    const existEmail = await admin_signup_model.findOne({ email: email });

    if (existEmail) {

        const matchPassword = await bcryptjs.compare(password, existEmail.password);

        if (matchPassword) {

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            req.session.otp = otp;

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.User,
                    pass: process.env.Pass
                }
            });

            let mailOptions = {
                from: process.env.User,
                to: existEmail.email,
                subject: 'Coolmate : OTP Verification Code',
                text: `Hello ${existEmail.name}!\nYour One-Time Password (OTP) for verification ${otp}`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });


            const token = await existEmail.adminTokenGenerate();

            res.cookie('adminToken', token), {

                httpOnly: true,
                secure: true,
                maxAge: 365 * 24 * 60 * 60 * 1000,
            }

            req.flash('success', 'OTP sended in Your Email')
            return res.redirect(`/coolmate/auth/login/otp/${existEmail._id}`)
        }

        else {

            req.flash('error', 'Incorrcet Email or Password');
            return res.redirect('/coolmate/admin-login')
        }
    }

    else {
        req.flash('error', 'Invalid login details');
        return res.redirect('/coolmate/admin-login')
    }
}

const booking = async (req, res) => {

    const allBokingRequest = await booking_model.find().sort({ _id: -1 });
    const allService = await service_model.find();
    const totalBooking = allBokingRequest.length;

    const approvedBooking = await booking_model.find({ status: 'Approved' });
    const totalApprovedBooking = approvedBooking.length;

    const pendingBooking = await booking_model.find({ status: 'Pending' });
    const totalPendingBooking = pendingBooking.length;

    const rejectedBooking = await booking_model.find({ status: 'Rejected' });
    const totalRejectedBookng = rejectedBooking.length;


    res.render('../adminModule/Views/service_booking', { totalRejectedBookng, totalPendingBooking, totalApprovedBooking, totalBooking, allBokingRequest, allService })
}

const rejecBooking = async (req, res) => {

    const bookingSourse = await booking_model.findById(req.params.id);
    bookingSourse.status = 'Rejected';
    await bookingSourse.save();


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.User,
            pass: process.env.Pass
        }
    });

    const mailOptions = {
        from: process.env.User,
        to: bookingSourse.email,
        subject: 'AC Service Booking Update – Request Rejected',
        text: `Hey ${bookingSourse.name}! I am Sorry – Your AC Service Request Was Not Approved\n
        please contact : 8898787656`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    req.flash('success', 'Booking rejected successfully');
    return res.redirect('/coolmate/admin')

};

const approveBoking = async (req, res) => {

    const bookingSourse = await booking_model.findById(req.params.id);
    bookingSourse.status = 'Approved';
    await bookingSourse.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.User,
            pass: process.env.Pass
        }
    });

    const mailOptions = {
        from: process.env.User,
        to: bookingSourse.email,
        subject: 'AC Service Request Has Been Accepted',
        text: `Hey ${bookingSourse.name}! I am pleased to inform you that your AC service request has been accepted.
I will will reach you on your preferred date and time.`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    req.flash('success', 'Booking approved successfully');
    return res.redirect('/coolmate/admin')

}

const deleteBooking = async (req, res) => {

    await booking_model.findByIdAndDelete(req.params.id);
    req.flash('success', 'Booking details deleted successfully');
    return res.redirect('/coolmate/admin')

}

const addService = (req, res) => {

    res.render('../adminModule/Views/add_service')

}

const addServicePost = async (req, res) => {

    const acServiceData = req.body;
    const new_service_model = service_model(acServiceData)
    await new_service_model.save();

    req.flash('success', 'Service added successfully');
    return res.redirect('/coolmate/admin')

}

const serviceList = async (req, res) => {

    const allServices = await service_model.find().sort({ _id: -1 });

    res.render('../adminModule/Views/service_list', { allServices })

}

const deleteService = async (req, res) => {

    await service_model.findByIdAndDelete(req.params.id);
    req.flash('success', 'Service deleted sucessfully');
    return res.redirect('/coolmate/admin/service-list')

}

const editService = async (req, res) => {

    const serviceSourse = await service_model.findById(req.params.id)

    res.render('../adminModule/Views/edit_service', { serviceSourse })

}

const editServicePost = async (req, res) => {

    const editServiceData = req.body;
    await service_model.findByIdAndUpdate(req.params.id, editServiceData);
    req.flash('success', 'Service update successfully');
    return res.redirect('/coolmate/admin/service-list')

}

const adminDashboard = async (req, res) => {

    const adminSourse = await admin_signup_model.findById(req.adminId)
    const today = new Date().toISOString().split('T')[0];
    const todayTotalBiling = await bill_model.find({ invoiceDate: today });
    const todayEarning = await todayTotalBiling.reduce((total, b) => b.grandTotal + total, 0).toFixed(2);


    const pendingService = await booking_model.find({ status: 'Pending' });
    const totalpendingService = pendingService.length;

    const todayService = await booking_model.find({ preferred_date: today });
    const totalTodayService = todayService.length;


    const currentDay = new Date();
    const last7days = new Date();  // clone current date
    last7days.setDate(currentDay.getDate() - 7);

    const lastSevenDaysStr = last7days.toISOString().split('T')[0];


    const lastWeekBiling = await bill_model.find({ invoiceDate: { $gte: lastSevenDaysStr } });




    res.render('../adminModule/Views/admin_dashboard', { lastWeekBiling, todayEarning, adminSourse, totalpendingService, totalTodayService })

}

const makeInvoice = async (req, res) => {

    const allServices = await service_model.find();

    res.render('../adminModule/Views/make_invoice', { allServices })

}

const makeInvoicePost = async (req, res) => {

    try {

        const invoiceData = req.body;
        const InvoiceGenerate = async () => {
            const today = new Date();
            const currentYear = today.getFullYear();
            const totalBill = await bill_model.countDocuments()
            const converTotalBill = String(totalBill).padStart(5, '0')

            return `CM-${currentYear}-${converTotalBill}`
        }

        invoiceData.invoiceNo = await InvoiceGenerate();

        const new_bill_model = new bill_model(invoiceData);
        await new_bill_model.save();

        const inputPdfPath = path.join(__dirname, '../../invoice_format/coolmate (1).pdf');

        const existingPdfBytes = await fs.readFile(inputPdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        form.getTextField('invoiceDate').setText(invoiceData.invoiceDate || '');
        form.getTextField('customerName').setText(invoiceData.customerName || '');
        form.getTextField('customerPhone').setText(invoiceData.customerPhone || '');
        form.getTextField('invoiceNo').setText(invoiceData.invoiceNo || '');
        form.getTextField('subtotal').setText(invoiceData.subtotal.toString() || '');
        form.getTextField('discount').setText(invoiceData.discount.toString() || '');
        form.getTextField('taxAmount').setText(invoiceData.taxAmount.toString() || '');
        form.getTextField('grandTotal').setText(invoiceData.grandTotal.toString() || '');

        const firstPage = pdfDoc.getPage(0);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        let startY = 550;
        const rowHeight = 20;

        function drawLeft(page, text, col, y, size, font) {
            page.drawText(text, { x: col.left, y, size, font });
        }

        const colBounds = {
            no: { left: 65, right: 85 },
            serviceName: { left: 110, right: 370 },
            item: { left: 110, right: 370 },
            qty: { left: 395, right: 480 },
            rate: { left: 440, right: 540 },
            itemAmount: { left: 490, right: 620 }
        };


        invoiceData.service.forEach((s, index) => {

            const y = startY - (index * rowHeight);

            drawLeft(firstPage, String(index + 1), colBounds.no, y, 11, font);

            drawLeft(firstPage, s.serviceName || '', colBounds.serviceName, y, 11, font);
            drawLeft(firstPage, s.item || '', colBounds.item, y, 11, font);
            drawLeft(firstPage, String(s.qty || 0), colBounds.qty, y, 11, font);
            drawLeft(firstPage, String(s.rate || 0), colBounds.rate, y, 11, font);
            drawLeft(firstPage, String(s.itemAmount || 0), colBounds.itemAmount, y, 11, font);

        })

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Marriage_Certificate.pdf"');
        res.end(pdfBytes);

    }

    catch (err) {

        console.log('Invoice Generating error', err)
    }

}

const report = async (req, res) => {


    const everyMonthEarning = await bill_model.aggregate([


        {
            $match: {
                invoiceDate: { $exists: true, $ne: null, $ne: "" }
            }
        },

        {
            $addFields: {

                convertedDate: {

                    $toDate: '$invoiceDate'
                }
            }
        },

        {
            $group: {

                _id: {

                    year: {
                        $year: '$convertedDate'
                    },

                    month: {

                        $month: '$convertedDate'
                    }
                },

                totalEarning: {

                    $sum: '$grandTotal'
                }
            }
        },

        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        }

    ])

    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]


    const foramatedmonthlyEarning = everyMonthEarning.map((e) => {


        return {

            month: months[e._id.month - 1],
            year: e._id.year,
            earning: e.totalEarning
        }
    })


    res.render('../adminModule/Views/report', { monthlyEarning: foramatedmonthlyEarning })

}

const otp = (req, res) => {

    res.render('../adminModule/Views/otp')

}

const otpPost = async (req, res) => {

    try {

        const adminSourse = await admin_signup_model.findById(req.params.id)

        if (req.session.otp === req.body.otp) {

            delete req.session.otp;

            const adminSourse = await admin_signup_model.findById(req.params.id);
            const token = await adminSourse.adminTokenGenerate();
            res.cookie('adminToken', token), {

                httpOnly: true,
                secure: true,
                maxAge: 365 * 24 * 60 * 60 * 1000,
            }

            req.flash('success', 'You are welcome')
            return res.redirect('/coolmate/admin')
        }

        else {


            req.flash('error', 'Invalid OTP');
            return res.redirect(`/coolmate/auth/login/otp/${adminSourse._id}`)
        }
    }

    catch (err) {
        console.log('otp submitted error', err)
    }


}

const logout = (req, res) => {

    res.clearCookie('adminToken');

    req.flash('success', 'You are logge out successfuly');
    return res.redirect('/coolmate/admin-login')
}

const updateProfile = async (req, res) => {

    const adminSourse = await admin_signup_model.findById(req.adminId)


    res.render('../adminModule/Views/profile_update', { adminSourse })

}

const updateProfilePost = async (req, res) => {

    const updateProfileData = req.body;

    await admin_signup_model.findByIdAndUpdate(req.adminId, updateProfileData);
    req.flash('success', 'Profile update successfully');
    return res.redirect('/coolmate/admin');

}

const forgetPasswordPost = async (req, res) => {

    const { email } = req.body;

    const existEmail = await admin_signup_model.findOne({ email: email });

    if (existEmail) {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User,
                pass: process.env.Pass,
            }
        });

        let mailOptions = {
            from: process.env.User,
            to: existEmail.email,
            subject: 'Coolmate : Reset Password',
            text: `Reset Your password using This link : \n http://localhost:3000/coolmate/reset-password/${existEmail._id} `
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        req.flash('success', 'Please check your email');
        return res.redirect('/coolmate/admin-login')

    }

    else {
        req.flash('error', 'Email is not exist');
        return res.redirect('/coolmate/admin-login')
    }

}

const resetPassword = (req, res) => {

    res.render('../adminModule/Views/reset_password')
}

const resetPasswordPost = async (req, res) => {

    const { newPassword } = req.body;
    const adminSourse = await admin_signup_model.findById(req.params.id);
    adminSourse.password = newPassword;
    await adminSourse.save();

    req.flash('success', 'Password update successfully');
    return res.redirect('/coolmate/admin-login')


}

module.exports = { resetPasswordPost, resetPassword, forgetPasswordPost, updateProfilePost, updateProfile, logout, otpPost, otp, report, makeInvoicePost, makeInvoice, adminDashboard, editServicePost, editService, deleteService, serviceList, addServicePost, addService, deleteBooking, approveBoking, rejecBooking, booking, adminLoginPost, adminLogin, adminSignupPost };