const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const cors = require('cors'); 
require('dotenv').config(); // This allows us to use variables in .env file through process.env
const isProduction = process.env.NODE_ENV === 'production'; // process.env will be used by heroku to provide configs and NODE_ENV will be set to production there.
const history = require('connect-history-api-fallback');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')

// import all the express routes we will be using
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const sessionRouter = require('./routes/session');
const imagesRouter = require('./routes/images');
const model3dsRouter = require('./routes/model3ds');

// create our app
const app = express();

app.use(fileUpload())

// set up user session
app.use(session({
  secret: 'novid',
  resave: true,
  saveUninitialized: true
}));

// allows us to make requests from POSTMAN
app.use(cors());

// set up the app to use dev logger
app.use(logger('dev'));

// accept json
app.use(express.json());

// https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0
// allows object nesting in POST
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
)
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// cookies for sessions
app.use(cookieParser());

// server html+css+js frontend
app.use(history());
app.use(express.static(path.join(__dirname, isProduction ? 'dist' : 'public'))); // in Heroku we want dist but for dev we want public so we don't have to rebuild everytime we change something.


// connect url hierarchies to our routers
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/session', sessionRouter);
app.use('/api/images', imagesRouter);
app.use('/api/model3ds', model3dsRouter);

app.use((req, res, next) => {
  res.status(404).send("The requested page or resource is not found.").end();
});

/*
app.use('*', function (req, res) {
  res.redirect('/').end();
});
*/

console.log("Running on localhost:3000...");

module.exports = app;
