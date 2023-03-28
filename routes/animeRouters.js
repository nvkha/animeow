const express = require('express');
const animeController = require('./../controllers/animeController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);


router.route('/').get(animeController.getAllAnime).post(animeController.createAnime);
router.route('/:id').get(animeController.getAnime).patch(animeController.updateAnime).delete(auanimeController.deleteAnime);

module.exports = router;