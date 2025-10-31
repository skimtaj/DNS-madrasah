const mongoose = require('mongoose');
const resultSchema = mongoose.Schema({

    student_portal_no: {

        type: String
    },

    student_name: {

        type: String
    },

    student_class: {

        type: String
    },

    roll_number: {

        type: String
    },

    examType: {

        type: String
    },

    marktSheetUplod: {

        type: String
    }

});

module.exports = mongoose.model('student_result_model', resultSchema)