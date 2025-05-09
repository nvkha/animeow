const express = require('express');
const parameterController = require('./../controllers/parameterController');
const authController = require('./../controllers/authController');

const router = express.Router();
if (process.env.NODE_ENV === 'production') {
    router.use(authController.protect);
    router.use(authController.restrictTo('admin'));
}

router.route('/').get(parameterController.getAllParameter).post(parameterController.createParameter);
router.route('/:id').get(parameterController.getParameter).patch(parameterController.updateParameter).delete(parameterController.deleteParameter);

module.exports = router;