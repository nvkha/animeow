const express = require('express');
const playerController = require('./../controllers/playerController');

const router = express.Router();

router.route("/player").post(playerController.getPlayer);

module.exports = router;