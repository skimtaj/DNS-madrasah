require('dotenv').config();
const express = require('express');
const JWT = require('jsonwebtoken')
const app = express();

const cookieParser = require('cookie-parser');

app.use(cookieParser());


const adminAuth = (req, res, next) => {

    const token = req.cookies.adminToken;

    if (!token) {
        req.flash('error', 'Please login to continue')
        return res.redirect('/coolmate/admin-login')
    };

    const verified = JWT.verify(token, process.env.Admin_Token_Password);
    req.adminId = verified._id;
    next();

};


module.exports = adminAuth