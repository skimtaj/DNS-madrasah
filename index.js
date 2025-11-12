const express = require('express');
const app = express();
const db = require('./DB');
const path = require('path');
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
require('dotenv').config();
const cookieParser = require('cookie-parser');
app.use(cookieParser())


app.use(session({
    secret: process.env.session_secret_key,
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());

app.use((req, res, next) => { res.locals.messages = req.flash(); next(); });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

app.use(bodyParser.json());

app.use('/', require('./userModule/routes/user_routes'));

app.use('/', require('./adminModule/routes/admin_routes'))


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('Server is conneceted')
})
