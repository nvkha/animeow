const Anime = require('./../models/animeModel');
const factory = require('./handlerFactory');

exports.getAllAnime = factory.getAll(Anime);
exports.getAnime = factory.getOne(Anime, {path: 'genres'});
exports.updateAnime = factory.updateOne(Anime);
exports.createAnime = factory.createOne(Anime);
exports.deleteAnime = factory.deleteOne(Anime);
