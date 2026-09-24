require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const {MongoStore} = require('connect-mongo');
require('dns').setServers(['8.8.8.8', '1.1.1.1']);   // <-- shuni qo'shing

const sections = require('./config/sections');
const helpers = require('./utils/helpers');
const wrap = require('./utils/asyncHandler');
const Profile = require('./models/Profile');
const { UPLOAD_DIR } = require('./utils/files');

const { MONGODB_URI, SESSION_SECRET, PORT = 3000, NODE_ENV } = process.env;
if (!MONGODB_URI || !SESSION_SECRET) {
  console.error('MONGODB_URI va SESSION_SECRET .env faylida bo\'lishi kerak.');
  process.exit(1);
}
const isProd = NODE_ENV === 'production';

const app = express();
if (isProd) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Barcha EJS sahifalarda tayyor turadigan o'zgaruvchilar
app.locals.sections = sections;
app.locals.h = helpers;

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGODB_URI }),
    cookie: { httpOnly: true, sameSite: 'lax', secure: isProd, maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

// Bir martalik xabarlar (flash) va profil ma'lumoti
app.use(
  wrap(async (req, res, next) => {
    req.flash = (type, text) => (req.session.flash = { type, text });
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    res.locals.profile = await Profile.getOne();
    next();
  })
);

app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/public'));

// 404 va xatolar
app.use((req, res) => res.status(404).render('error', { title: 'Not found', code: 404, message: 'This page does not exist.' }));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const code = err.status || (err.name === 'CastError' ? 404 : 500);
  if (code === 500) console.error(err);
  res.locals.profile = res.locals.profile || { logoText: 'HOME', fullName: 'Portfolio', footerText: '' };
  res.status(code).render('error', {
    title: code === 404 ? 'Not found' : 'Error',
    code,
    message: code === 404 ? 'This page does not exist.' : 'Something went wrong on our side.',
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('MongoDB ulanmadi:', err.message);
    process.exit(1);
  });
