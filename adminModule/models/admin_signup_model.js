const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const JWT = require('jsonwebtoken');
require('dotenv').config();

const adminSidnupSchema = mongoose.Schema({

    name: {

        type: String
    },

    mobile: {

        type: String
    },

    email: {

        type: String
    },

    password: {

        type: String
    },

    Tokens: [{

        token: {

            type: String
        }
    }]

});


adminSidnupSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 10);
    }
    next();
});

adminSidnupSchema.methods.generateAdminToken = async function () {

    const token = JWT.sign({ _id: this._id.toString() }, process.env.Admin_Token_Password, { expiresIn: '365d' })
    this.Tokens = this.Tokens.concat({ token: token });
    await this.save();

    return token;
}

module.exports = mongoose.model('admin_signup_model', adminSidnupSchema);

