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
    sources: [{
        server: {
            type: String,
            enum: ['fb', 'abyss', 'lotus', 'streamtape'],
            required: [true, 'Source must have a server!'],
        },
        file: {
            type: String,
            trim: true
        },
        videoUrl: {
            type: String,
            trim: true
        },
        label: {
            type: String,
            enum: ['360 P', '480 P', '720 P', '1080 P', 'hls P'],
            required: [true, 'Source must have a label!'],
        },
        type: {
            type: String,
            enum: ['mp4', 'hls'],
            required: [true, 'Source must have a type!'],
        }
    }],
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
            {$inc: {episodeCount: 1}, $set: {updatedAt: Date.now()}},
            {new: true, runValidators: true});

        const cacheAnimeListResult = await cache.get('anime:anime-list');
        if (cacheAnimeListResult) {
            logger.info(`[Post update] [Anime] Delete cache with key: anime:anime-list`);
            await cache.del('anime:anime-list');
        }
        const cacheAnimeListUpcomingResult = await cache.get('anime:anime-list-upcoming');
        if (cacheAnimeListUpcomingResult) {
            logger.info(`[Post update] [Anime] Delete cache with key: anime:anime-list-upcoming`);
            await cache.del('anime:anime-list-upcoming');
        }
        const cacheAnimeListRecentlyAddedResult = await cache.get('anime:anime-list-recently-added');
        if (cacheAnimeListRecentlyAddedResult) {
            logger.info(`[Post update] [Anime] Delete cache with key: anime:anime-list-recently-added`);
            await cache.del('anime:anime-list-recently-added');
        }
    }
    next();
});

episodeSchema.post('findOneAndUpdate', async function (doc, next) {
    if (doc) {
        const epsiodeKey = `episode:${doc.anime}/${doc.episodeNum}`;

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

        const epsiodeKey = `episode:${doc.anime}/${doc.episodeNum}`;
        const cacheEpisodeResult = await cache.get(epsiodeKey);
        if (cacheEpisodeResult) {
            logger.info(`[Post delete] [Episode] Delete cache with key: ${epsiodeKey}`);
            await cache.del(epsiodeKey);
        }

        const cacheAnimeListResult = await cache.get('anime:anime-list');
        if (cacheAnimeListResult) {
            logger.info(`[Post update] [Anime] Delete cache with key: anime:anime-list`);
            await cache.del('anime:anime-list');
        }
        const cacheAnimeListUpcomingResult = await cache.get('anime:anime-list-upcoming');
        if (cacheAnimeListUpcomingResult) {
            logger.info(`[Post update] [Anime] Delete cache with key: anime:anime-list-upcoming`);
            await cache.del('anime:anime-list-upcoming');
        }
        const cacheAnimeListRecentlyAddedResult = await cache.get('anime:anime-list-recently-added');
        if (cacheAnimeListRecentlyAddedResult) {
            logger.info(`[Post update] [Anime] Delete cache with key: anime:anime-list-recently-added`);
            await cache.del('anime:anime-list-recently-added');
        }
    }
    next();
});

episodeSchema.index({anime: 1, episodeNum: 1});

const Episode = mongoose.model('Episode', episodeSchema);

module.exports = Episode;