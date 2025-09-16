const admin_signup_model = require("../../adminModule/models/admin_signup_model");
const service_model = require("../../adminModule/models/service_model");
const booking_model = require("../models/booking_model");
require('dotenv').config();
const nodemailer = require('nodemailer')

const home = async (req, res) => {

    const allServices = await service_model.find().sort({ _id: -1 });

    res.render('../userModule/Views/home', { allServices })

};

const bookingForm = async (req, res) => {

    try {

        const bookingData = req.body;
        const new_booking_model = booking_model(bookingData);
        await new_booking_model.save();


        const allAdmin = await admin_signup_model.find();
        const adminEmail = await allAdmin.map((a) => a.email.split(','))

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User,
                pass: process.env.Pass
            }
        });

        const mailOptions = {
            from: process.env.User,
            to: adminEmail,
            subject: 'AC service booking request',
            text: `Request Details : \n
            Name : ${bookingData.name} \n
            Mobile : ${bookingData.mobile} \n
            Email : ${bookingData.email} \n
            Address : ${bookingData.address} \n 
            Service Type : ${bookingData.service} \n
            Preferred Date : ${bookingData.preferred_date}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });


        req.flash('success', 'Booking request submitted successfully');
        return res.redirect('/coolmate')
    }
    catch (err) {

        console.log(err)
        req.flash('error', 'Booking failed. Please try again');
        return res.redirect('/coolmate');
    }

}



module.exports = { home, bookingForm };