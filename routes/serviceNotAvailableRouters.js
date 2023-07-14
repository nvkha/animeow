const express = require('express');

const router = express.Router();

router.route("/").get(async (req, res, next) => {
    res.status(200).render('error-verify', {
        title: 'Verify'
    });
});

module.exports = router;