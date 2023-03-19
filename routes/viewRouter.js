const express = require('express');
const viewsController = require('./../controllers/viewsController');
const router = express.Router();

router.route('/').get(viewsController.getIndex);

router.route('/tim-kiem/:keyword').get(viewsController.search);

router.route('/the-loai/:genre/:page').get(viewsController.getGenre);
router.route('/the-loai/:genre').get(viewsController.getGenre);

router.route('/watch/:slug/:ep').get(viewsController.getAnime);
router.route('/watch/:slug').get(viewsController.getAnime);


module.exports = router;