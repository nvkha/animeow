const mongoose = require('mongoose');
const slugify = require('slugify');
const mongoosePaginate = require('mongoose-paginate-v2');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const animeSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Anime must have a title!'],
        unique: true,
        trim: true
    },
    otherTitle: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Anime must have a description!'],
        trim: true
    },
    genres: [{
        type: mongoose.Types.ObjectId,
        ref: 'Genre'
    }],
    image: {
        type: String,
        required: [true, 'Anime must have a image!'],
    },
    studio: String,
    releaseYear: {
        type: Number,
        required: [true, 'Anime must have a release year!'],
    },
    transTeam: String,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    type: {
        type: String,
        enum: ['tv', 'movie', 'n/a'],
        required: [true, 'Anime must have a type!']
    },
    status: {
        type: String,
        enum: ['finished', 'ongoing', 'upcoming', 'n/a'],
        required: [true, 'Anime must have a status!'],
    },
    episodeCount: {
        type: Number,
        default: 0
    },
    season: {
        type: String,
        enum: ['spring', 'summer', 'fall', 'winter', 'n/a'],
        required: [true, 'Anime must have a season!'],
    },
    quality: {
        type: String,
        enum: ['SD', 'HD', 'FullHD', 'N/A'],
        required: [true, 'Anime must have a quality!'],
    },
    trailer: String,
    relatedAnimeList: [{
        type: mongoose.Types.ObjectId,
        ref: 'Anime',
    }],
    active: {
        type: Boolean,
        default: true,
    }
});

animeSchema.pre('save', function (next) {
    logger.info(`[Pre save] [Anime] Create slug with title: ${this.title}`);
    this.slug = slugify(this.title.replace(/[^\p{L}0-9\- ]/gu, ''), {
        lower: true,
        trim: true,
        locale: 'vi',
    });
    next();
});

animeSchema.pre('findOneAndUpdate', function (next) {
    if (this._update.title) {
        logger.info(`[Pre update] [Anime] Update slug with new title: ${this._update.title}`);
        this._update.slug = slugify(this._update.title.replace(/[^\p{L}0-9\- ]/gu, ''), {
            lower: true,
            trim: true,
            locale: 'vi',
        });
    }
    next();
});

animeSchema.post('findOneAndUpdate', async function (doc, next) {
    if (doc) {
        const cacheAnimeResult = await cache.get('anime:' + doc.slug);
        if (cacheAnimeResult) {
            logger.info(`[Post update] [Anime] Delete cache with key: anime:${doc.slug}`);
            await cache.del('anime:' + doc.slug);
        }
    }
    next();
});

animeSchema.pre('findOneAndDelete', async function (next) {
    const animeId = this._conditions._id;
    logger.info(`[Pre delete] [Anime] Delete all episode with anime: ${animeId}`);
    await mongoose.model('Episode').deleteMany({anime: animeId});
    next();
});

animeSchema.post('findOneAndDelete', async function (doc, next) {
    if (doc) {
        const cacheAnimeResult = await cache.get('anime:' + doc.slug);
        if (cacheAnimeResult) {
            logger.info(`[Post delete] [Anime] Delete cache with key: anime:${doc.slug}`);
            await cache.del('anime:' + doc.slug);
        } else {
            logger.info(`[Post delete] [Anime] No cache with key: anime:${doc.slug}`);
        }
    }
    next();
});


animeSchema.plugin(mongoosePaginate);

animeSchema.index({title: 'text', otherTitle: 'text'})
animeSchema.index({active: 1});
animeSchema.index({genres: 1});
animeSchema.index({slug: 1});
animeSchema.index({type: 1});
animeSchema.index({updatedAt: -1});
animeSchema.index({releaseYear: -1});
animeSchema.index({releaseYear: -1, updatedAt: -1});

const Anime = mongoose.model('Anime', animeSchema);

module.exports = Anime;
