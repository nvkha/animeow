const express = require('express');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const animeRouter = require('./routes/animeRouters');
const userRouter = require('./routes/userRouters');
const genreRouter = require('./routes/genreRouters');
const episodeRouter = require('./routes/episodeRouters');
const parameterRouter = require('./routes/parameterRouters');
const adminRouter = require('./routes/adminRouter');
const viewRouter = require('./routes/viewRouter');

const app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

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
app.use(cookieParser())
app.use(mongoSanitize());
app.use(xss());

app.use(morgan('dev'));

app.use('/', viewRouter);
app.use('/animeow/admin', adminRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/animes', animeRouter);
app.use('/api/v1/genres', genreRouter);
app.use('/api/v1/episodes', episodeRouter);
app.use('/api/v1/parameters', parameterRouter);


app.use('/robots.txt', function (req, res) {
    res.type('text/plain')
    res.send("User-agent: *\nAllow: /");
});

app.all('*', (req, res, next) => {
    next(new AppError(`Oops, sorry we can't find that page!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;