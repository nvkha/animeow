const express = require('express');
const episodeController = require('./../controllers/episodeController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.route('/').get(episodeController.getAllEpisode).post(episodeController.createEpisode);
router.route('/:id').get(episodeController.getEpisode).patch(episodeController.updateEpisode).delete(episodeController.deleteEpisode);

module.exports = router;