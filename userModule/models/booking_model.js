const mongoose = require('mongoose');
const bookingSchema = mongoose.Schema({

    name: {

        type: String
    },

    mobile: {

        type: String
    },

    email: {

        type: String
    },

    address: {

        type: String
    },

    service: {

        type: String
    },

    preferred_date: {

        type: String
    },

    status: {

        type: String,
        default: 'Pending'
    }
});

const booking_model = mongoose.model('booking_model', bookingSchema);

module.exports = booking_model;

