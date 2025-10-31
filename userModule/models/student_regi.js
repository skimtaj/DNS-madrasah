const mongoose = require('mongoose');
const studentRegiSchema = mongoose.Schema({

    serial_no: {

        type: String
    },

    student_image: {

        type: String
    },

    student_name: {

        type: String
    },

    applied_class: {

        type: String
    },

    dob: {

        type: String
    },

    age: {

        type: String
    },

    Bangla_Shiksha_Portal: {

        type: String
    },

    nationality: {

        type: String
    },

    Village: {

        type: String
    },

    post: {

        type: String
    },

    ps: {

        type: String
    },

    District: {

        type: String
    },

    PIN_Code: {

        type: String
    },

    Guardian_Name: {

        type: String
    },

    Relation_with_Student: {

        type: String
    },

    occupation: {

        type: String
    },

    Mobile_No: {

        type: String
    },

    WhatsApp_No: {

        type: String
    },

    Aadhaar_Number: {

        type: String
    },

    bank_ac_no: {

        type: String
    },

    ifsc_code: {

        type: String
    },

    regi_fees: {

        type: Number
    },


    paymentScreenshot: {

        type: String
    },

    admission_Status: {

        type: String,
        default: 'Pending'
    },

    admission_mode: {

        type: String,
        default: 'Online'
    },

    payment_Status: {

        type: String
    },

    application_date: {

        type: String
    },

}, { timestamps: true });

const student_regi = mongoose.model('student_regi', studentRegiSchema);

module.exports = student_regi;