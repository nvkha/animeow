const mongoose = require('mongoose');
const slugify = require('slugify');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const genreSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Genre must have a name!"],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
    }
});

genreSchema.pre('save', function (next) {
    logger.info(`[Pre save] [Genre] Create slug with name: ${this.name}`);
    this.slug = slugify(this.name, {
        lower: true,
        trim: true,
        locale: 'vi',
    });
    next();
});

genreSchema.post('save', async function (doc, next) {
    if (doc) {
        const cacheResult = await cache.get('genres');
        if (cacheResult) {
            logger.info('[Post save] [Genre] Delete cache with key: genres');
            await cache.del('genres');
        }
    }
    next();
});

genreSchema.pre('findOneAndUpdate', function (next) {
    if (this._update.name) {
        logger.info(`[Pre update] [Genre] Update slug with new name: ${this._update.name}`);
        this._update.slug = slugify(this._update.name, {
            lower: true,
            trim: true,
            locale: 'vi',
        });
    }
    next();
});

genreSchema.post('findOneAndUpdate', async function (doc, next) {
    if (doc) {
        const cacheResult = await cache.get('genres');
        if (cacheResult) {
            logger.info('[Post update] [Genre] Delete cache with key: genres');
            await cache.del('genres');
        }
    }
    next();
});

genreSchema.post('findOneAndDelete', async function (doc, next) {
    if (doc) {
        const cacheResult = await cache.get('genres');
        if (cacheResult) {
            logger.info('[Post delete] [Genre] Delete cache with key: genres');
            await cache.del('genres');
        }
    }
    next();
});

genreSchema.index({slug: 1});

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;