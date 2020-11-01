const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

// import all the express routes we will be using
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const freetsRouter = require('./routes/freets');
const sessionRouter = require('./routes/session');
const upvotesRouter = require('./routes/upvotes');
const followsRouter = require('./routes/follows');
const refreetsRouter = require('./routes/refreets');

// create app
const app = express();

// set up user session
app.use(session({
    secret: 'Freet',
    resave: true,
    saveUninitialized: true
  }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// connect url hierarchies to our routers
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/freets', freetsRouter);
app.use('/api/users/session', sessionRouter);
app.use('/api/upvotes', upvotesRouter);
app.use('/api/follows', followsRouter);
app.use('/api/refreets', refreetsRouter);

app.use('*', function (req, res) {
  res.redirect('/').end();
});

module.exports = app;
