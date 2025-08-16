require('dotenv').config();
const express = require('express');
const app = express();
app.set('view engine', 'ejs');

const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const db = require('./DB')

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());
app.use((req, res, next) => { res.locals.messages = req.flash(); next(); });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));
app.use(bodyParser.json());

app.use('/', require('./routes/home'));
app.use('/', require('./routes/user_routes'));
app.use('/', require('./routes/admin_routes'));


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('Server is connected')
})



