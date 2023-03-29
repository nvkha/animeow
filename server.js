const mongoose = require('mongoose');
const dotenv = require('dotenv');
const schedule = require('node-schedule');
const logger = require('./utils/logger');

const googleAnalyticsUtils = require('./utils/googleAnalyticsUtils');
const sitemapGenerator = require('./utils/sitemapGenerator');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({path: '.env'});
const app = require('./app');

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB connected...'));

schedule.scheduleJob('0 * * * *', async function () {
    try {
        console.log(`Start update top most views job`);
        await googleAnalyticsUtils.getTopMostViews();
    } catch (err) {
        logger.error(err);
    }
});

schedule.scheduleJob('0 0 * * *', async function () {
    try {
        console.log(`Start update sitemap job`);
        await sitemapGenerator.createAnimeSitemap();
    } catch (err) {
        logger.error(err);
    }
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});


