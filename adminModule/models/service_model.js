const mongoose = require('mongoose');
const servicewSchema = mongoose.Schema({

    serviceName: {

        type: String
    },

    serviceCharge: {

        type: Number
    }

});

const service_model = mongoose.model('service_model', servicewSchema);
module.exports = service_model;

