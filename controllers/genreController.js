const Genre = require('./../models/genreModel');
const factory = require('./handlerFactory');

exports.getAllGenre = factory.getAll(Genre);
exports.getGenre = factory.getOne(Genre);
exports.updateGenre = factory.updateOne(Genre);
exports.createGenre = factory.createOne(Genre);
exports.deleteGenre = factory.deleteOne(Genre);

//exports.getAllAnimeByGenre = async (req, res, next) => {
//    try {
//        const animes = await AnimeGenre.find({ genre: req.param.genre }).populate('anime');
//        res.status(200).json({
//            status: 'success',
//            data: {
//                animes
//            }
//        });
//    } catch (err) {
//        next(err);
//    }
//}

