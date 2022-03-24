const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const request = require("request");
// Automatic website-page-reloading
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");

const locals = require("express/lib/application").locals;

const PORT = process.env.PORT || 3000

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(connectLiveReload());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));

app.use('/', indexRouter);
app.use('/index', indexRouter);
app.use('/users', usersRouter);

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  errorMsg = err.message;
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {errorMsg: errorMsg});
});



module.exports = app;


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
