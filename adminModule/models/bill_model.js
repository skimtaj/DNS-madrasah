const mongoose = require('mongoose');
const billSchema = mongoose.Schema({
    invoiceDate: { type: String },
    customerName: { type: String },
    customerPhone: { type: String },
    customerAddress: { type: String },
    invoiceNo: { type: String },

    subtotal: { type: Number },
    discount: { type: Number },
    gstRate: { type: Number },
    taxAmount: { type: Number },
    grandTotal: { type: Number },

    service: [{
        serviceType: { type: String },
        serviceName: { type: String },
        item: { type: String },
        qty: { type: Number },
        rate: { type: Number },
        itemAmount: { type: Number }
    }]
});

const bill_model = mongoose.model('bill_model', billSchema);
module.exports = bill_model;