const pino = require('pino');

let streams;
if(process.env.NODE_ENV === 'dev') {
    streams = [
        { stream: process.stdout }
    ]
} else {
    streams = [
        { stream: process.stdout},
        { stream: pino.destination(`${__dirname}/../logs/error.log`) }
    ]
}


module.exports = pino({
    level: process.env.PINO_LOG_LEVEL || 'info',
}, pino.multistream(streams));