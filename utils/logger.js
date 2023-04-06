const pino = require('pino');
const fs = require('fs');

let streams;
if (process.env.NODE_ENV === 'dev') {
    streams = [
        {stream: process.stdout}
    ]
} else {
    if (!fs.existsSync(`${__dirname}/../logs/error.log`)) {
        fs.mkdirSync(`${__dirname}/../logs`);
        fs.open(`${__dirname}/../logs/error.log`, 'w', function (err, file) {
            if (err) throw err;
            console.log('Create logs folder');
        });
    }

    streams = [
        {stream: process.stdout},
        {stream: pino.destination(`${__dirname}/../logs/error.log`)}
    ]
}


module.exports = pino({
    level: process.env.NODE_ENV === 'dev' ? 'info' : 'error',
}, pino.multistream(streams));