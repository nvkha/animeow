const {GoogleSpreadsheet} = require('google-spreadsheet');
const creds = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

exports.writeErrorIntoGoogleSheet = async (req, res, next) => {
    try {
        const url = req.body.url;
        const episodeId = req.body.id;

        if (!url || !episodeId) {
            res.status(400).send();
        }

        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('1_WpZoc55FZ3k5zBKSQYMF715_8kbgoZzY8KZdAfWQWA');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        // read rows
        const rows = await sheet.getRows(); // can pass in { limit, offset }
        for (let i = 0; i < rows.length; i++) {
            if (url === rows[i].url) {
                rows[i].id = episodeId;
                rows[i].status = 'not fixed yet'
                rows[i].date = new Date().toLocaleDateString('vi-VN')
                await rows[i].save();
                return res.status(200).send('Chúng tôi đã ghi nhận lỗi của tập phim này!');
            }
        }

        await sheet.addRow({
            id: episodeId,
            url: url,
            date: new Date().toLocaleDateString('vi-VN'),
            status: 'not fixed yet'
        });
        return res.status(200).send('Chúng tôi đã ghi nhận lỗi của tập phim này!');

    } catch (err) {
        next(err);
    }
}