const express = require('express');
const route = express.Router();
const auth = require('../../auth/admin_auth')

const { resetPasswordPost, resetPassword, forgetPasswordPost, updateProfilePost, updateProfile, logout, otpPost, otp, report, makeInvoicePost, makeInvoice, adminDashboard, editServicePost, editService, deleteService, serviceList, addServicePost, addService, deleteBooking, approveBoking, rejecBooking, booking, adminLoginPost, adminLogin, adminSignupPost } = require('../../adminModule/controllers/adminControllers')


route.get('/coolmate/admin-login', adminLogin);
route.post('/coolmate/admin-login', adminLoginPost);

route.get('/coolmate/admin', auth, adminDashboard)

route.post('/coolmate/admin-signup', adminSignupPost);

route.get('/coolmate/admin/booking', booking);

route.get('/reject-booking/:id', rejecBooking);

route.get('/approve-booking/:id', approveBoking);

route.get('/delete-booking/:id', deleteBooking);

route.get('/coolmate/admin/add-service', addService);

route.post('/coolmate/add-service', addServicePost);

route.get('/coolmate/admin/service-list', serviceList);

route.get('/delete-service/:id', deleteService);

route.get('/edit-service/:id', editService);

route.post('/edit-service/:id', editServicePost);

route.get('/coolmate/admin/make-invoice', makeInvoice);

route.post('/coolmate/admin/make-invoice', makeInvoicePost);

route.get('/coolmate/admin/report', report)

route.get('/coolmate/auth/login/otp/:id', otp);

route.post('/coolmate/auth/login/otp/:id', otpPost);

route.get('/logout', logout);

route.get('/coolmate/admin/update-profile', auth, updateProfile);

route.post('/coolmate/admin/update-profile', auth, updateProfilePost);

route.post('/coolmate/forget-password', forgetPasswordPost);

route.get('/coolmate/reset-password/:id', resetPassword);

route.post('/coolmate/reset-password/:id', resetPasswordPost)







module.exports = route; 