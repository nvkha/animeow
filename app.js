const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const responseTime = require('response-time');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const animeRouter = require('./routes/animeRouters');
const userRouter = require('./routes/userRouters');
const genreRouter = require('./routes/genreRouters');
const episodeRouter = require('./routes/episodeRouters');
const parameterRouter = require('./routes/parameterRouters');
const viewRouter = require('./routes/viewRouter');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
// This disables the `contentSecurityPolicy` middleware but keeps the rest.
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);
app.use(express.json({limit: '1mb'}));
app.use(mongoSanitize());
app.use(xss());

if (process.env.NODE_ENV === 'dev') {
    app.use(responseTime());
}

// const limiter = rateLimit({
//     max: 100,
//     windowMs: 60 * 60 * 100,
//     message: 'Too many request from this IP!'
// });
//
// app.use(limiter);

// Development logging
if (process.env.NODE_ENV === 'dev') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('common'));
}

//app.use(compression());

app.use('/', viewRouter);
app.use('/api/v1/animes', animeRouter);
app.use('/api/v1/genres', genreRouter);
app.use('/api/v1/episodes', episodeRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/parameters', parameterRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Oops, sorry we can't find that page!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;