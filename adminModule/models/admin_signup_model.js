const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const JWT = require('jsonwebtoken');
require('dotenv').config();


const adminSchema = mongoose.Schema({

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

    Token: [{

        tokens: {

            type: String
        }
    }]


});


adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 10);
    }
    next();
});

adminSchema.methods.adminTokenGenerate = async function () {

    try {
        const token = JWT.sign({ _id: this._id.toString() }, process.env.Admin_Token_Password, { expiresIn: '365d' });
        this.Token = this.Token.concat({ token: token });
        await this.save();
        return token;
    }

    catch (err) {

        console.log('This is admin token generating error', err)
    }
}



const admin_signup_model = mongoose.model('admin_signup_model', adminSchema);
module.exports = admin_signup_model;