const Parameter = require('./../models/parameterModel');
const factory = require('./handlerFactory');

exports.getAllParameter = factory.getAll(Parameter);
exports.getParameter = factory.getOne(Parameter);
exports.updateParameter = factory.updateOne(Parameter);
exports.createParameter = factory.createOne(Parameter);
exports.deleteParameter = factory.deleteOne(Parameter);