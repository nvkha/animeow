const mongoose = require('mongoose');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const episodeSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Episode must have a title!'],
        trim: true,
    },
    episodeNum: {
        type: Number,
        required: [true, 'Episode must have a episode number!'],
    },
    videoUrl: {
        type: String,
        trim: true
    },
    videoUrlBackup: {
        type: String,
        trim: true
    },
    anime: {
        type: mongoose.Types.ObjectId,
        ref: 'Anime',
        required: [true, "Episode must have a anime id!"]
    }
});

episodeSchema.post('save', async function (doc, next) {
    if (doc) {
        logger.info('[Post save] [Episode] Increment episode count by 1');
        await mongoose.model('Anime').findOneAndUpdate(
            {_id: doc.anime},
            {$inc: {episodeCount: 1}},
            {new: true, runValidators: true});
    }
    next();
});

episodeSchema.post('findOneAndUpdate', async function (doc, next) {
    if (doc) {
        const epsiodeKey = `${doc.anime}/${doc.episodeNum}`;

        const cacheEpisodeResult = await cache.get(epsiodeKey);
        if (cacheEpisodeResult) {
            logger.info(`[Post update] [Episode] Delete cache with key: ${epsiodeKey}`);
            await cache.del(epsiodeKey);
        }
    }
    next();
});

episodeSchema.post('findOneAndDelete', async function (doc, next) {
    if (doc) {
        logger.info('[Post delete] [Episode] Decrement episode count by 1');
        await mongoose.model('Anime').findOneAndUpdate(
            {_id: doc.anime},
            {$inc: {episodeCount: -1}},
            {new: true, runValidators: true}).lean();

        const epsiodeKey = `${doc.anime}/${doc.episodeNum}`;
        const cacheEpisodeResult = await cache.get(epsiodeKey);
        if (cacheEpisodeResult) {
            logger.info(`[Post delete] [Episode] Delete cache with key: ${epsiodeKey}`);
            await cache.del(epsiodeKey);
        }
    }
    next();
});

episodeSchema.index({anime: 1, episodeNum: 1});

const Episode = mongoose.model('Episode', episodeSchema);

module.exports = Episode;