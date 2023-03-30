const express = require('express');
const genreController = require('./../controllers/genreController');
const authController = require('./../controllers/authController');

const router = express.Router();
if (process.env.NODE_ENV === 'production') {
    router.use(authController.protect);
    router.use(authController.restrictTo('admin'));
}

router.route('/').get(genreController.getAllGenre).post(genreController.createGenre);

router.route('/:id').get(genreController.getGenre).patch(genreController.updateGenre).delete(genreController.deleteGenre);

module.exports = router;