const express = require('express');
const route = express.Router();

const { home, bookingForm } = require('../../userModule/controllers/userControllers');

route.get('/coolmate', home)

route.post('/coolmate/booking', bookingForm);



module.exports = route; 
