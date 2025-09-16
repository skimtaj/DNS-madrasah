const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const db = require('./DB')

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser())

app.use(flash());
app.use((req, res, next) => { res.locals.messages = req.flash(); next(); });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));
app.set('view engine', 'ejs');
app.use(bodyParser.json());


app.use('/', require('./userModule/routes/userRoutes'));
app.use('/', require('./adminModule/routes/adminRoutes'))

const PORT = process.env.PORT || 3000;
app.listen(3000, () => {

    console.log('Server is connected')
})