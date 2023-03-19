const Episode = require('./../models/episodeModel');
const factory = require('./handlerFactory');

exports.getAllEpisode = factory.getAll(Episode);
exports.getEpisode = factory.getOne(Episode);
exports.updateEpisode = factory.updateOne(Episode);
exports.createEpisode = factory.createOne(Episode);
exports.deleteEpisode = factory.deleteOne(Episode);
