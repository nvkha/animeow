const express = require('express');
const playerController = require('./../controllers/errorReportController');

const router = express.Router();

router.route("/").post(playerController.writeErrorIntoGoogleSheet);

module.exports = router;