const express = require('express');
const viewsController = require('./../controllers/viewsController');

const router = express.Router();

router.route('/').get(viewsController.getIndex);

router.route('/login').get(viewsController.login);

router.route('/filter').get(viewsController.filter);

router.route('/sap-chieu/:page').get(viewsController.getUpcoming);
router.route('/sap-chieu').get(viewsController.getUpcoming);

router.route('/movie/:page').get(viewsController.getMovie);
router.route('/movie').get(viewsController.getMovie);

router.route('/anime/:page').get(viewsController.getAllAnime);
router.route('/anime').get(viewsController.getAllAnime);

router.route('/tim-kiem/:keyword').get(viewsController.search);

router.route('/the-loai/:genre/:page').get(viewsController.getGenre);
router.route('/the-loai/:genre').get(viewsController.getGenre);

router.route('/watch/:slug/:ep').get(viewsController.getAnime);
router.route('/watch/:slug').get(viewsController.getAnime);

router.route('/privacy-policy').get(viewsController.getPrivacyPolicy);

module.exports = router;