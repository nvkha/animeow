const express = require('express');
const parameterController = require('./../controllers/parameterController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(parameterController.getAllParameter).post(parameterController.createParameter);
router.route('/:id').get(parameterController.getParameter).patch(parameterController.updateParameter).delete(parameterController.deleteParameter);

module.exports = router;