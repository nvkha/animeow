const pino = require('pino');

let streams = [{stream: process.stdout}];
module.exports = pino({
    level: process.env.NODE_ENV === 'dev' ? 'info' : 'error',
}, pino.multistream(streams));