const mongoose = require('mongoose');
const feesSchema = mongoose.Schema({


    academic_year: {

        type: String
    },

    className: {

        type: String
    },

    admission_fees: {

        type: Number
    },

    development_fees: {

        type: Number
    },

    milad_fees: {

        type: Number
    },

    id_card_fees: {

        type: Number
    },

    anjuman_fees: {

        type: Number
    },

    grand_total: {

        type: Number
    },

    game_fees: {

        type: Number
    }

})

const fees_mode = mongoose.model('fees_mode', feesSchema);

module.exports = fees_mode;