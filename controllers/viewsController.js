const Anime = require('./../models/animeModel');
const Genre = require('./../models/genreModel');
const Episode = require('./../models/episodeModel');
const Parameter = require('./../models/parameterModel');

const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const axios = require('axios');
const cache = require('../utils/cache');

exports.getIndex = async (req, res, next) => {
    try {
        const [topMostViewsDay, topMostViewsWeek, topMostViewsMonth] = await getTopMostViews();

        const alertPromise = Parameter.findOne({name: 'alert'}).lean();
        const slideListPromise = Parameter.findOne({name: 'slides'}).lean();
        const genresPromise = getGenres();
        const animeListPromise = Anime
            .find()
            .select('title slug image runningTime updatedAt quality releaseYear')
            .sort({releaseYear: -1, updatedAt: -1})
            .limit(15)
            .lean();

        const [alert, slideList, genres, animeList] = await Promise.all([alertPromise, slideListPromise, genresPromise, animeListPromise]);

        res.status(200).render('index', {
            title: 'Anime Vietsub Online', alert, slideList, genres, animeList,
            topMostViewsDay, topMostViewsWeek, topMostViewsMonth
        });
    } catch (err) {
        next(err);
    }
}

exports.getAnime = async (req, res, next) => {
    try {
        const [topMostViewsDay, topMostViewsWeek, topMostViewsMonth] = await getTopMostViews();

        let episodeNum;
        if (!req.params.ep) {
            episodeNum = 1;
        } else if (!/^tap-[1-9]+/.test(req.params.ep)) {
            return next(new AppError("Oops, sorry we can't find that page!", 404));
        } else {
            episodeNum = req.params.ep.split('-')[1];
        }

        let anime;
        const genresPromise = getGenres();
        const animeCacheResultPromise = cache.get(req.params.slug);

        const [genres, animeCacheResult] = await Promise.all([genresPromise, animeCacheResultPromise]);
        if (animeCacheResult) {
            logger.info(`Cache hit with key: ${req.params.slug}`);
            anime = JSON.parse(animeCacheResult);
        } else {
            logger.info(`Cache miss with key: ${req.params.slug}`);
            anime = await Anime
                .findOne({slug: req.params.slug})
                .populate({path: 'genres', select: 'name slug'})
                .lean();
            if (!anime) {
                return next(new AppError("Oops, sorry we can't find that page!", 404));
            }
            logger.info(`Set key into redis`);
            await cache.set(req.params.slug, JSON.stringify(anime));
        }

        let episode;
        const episodeKey = `${anime._id}/${episodeNum}`;
        const episodeCacheResult = await cache.get(episodeKey);
        if (episodeCacheResult) {
            logger.info(`Cache hit with key: ${episodeKey}`);
            episode = JSON.parse(episodeCacheResult);
            if (episode.oe <= Date.now()) {
                logger.info(`Episode video url expired with timestamp: ${episode.oe}, current timestamp ${Date.now()}`);
                try {
                    episode.tempVideoUrl = await getVideoSource(episode.videoUrl);
                    episode.oe = parseInt(new URL(episode.tempVideoUrl).searchParams.get('oe'), 16) * 1000;
                    logger.info('Set key into redis');
                    await cache.set(episodeKey, JSON.stringify(episode));
                } catch (err) {
                    logger.error({
                        message: err.message,
                        _anime_id: anime._id,
                        _episodeNum: episodeNum,
                        reponse: err.response.data
                    });
                }
            }
        } else {
            logger.info(`Cache miss with key: ${episodeKey}`);
            episode = await Episode.findOne({
                anime: anime._id,
                episodeNum: episodeNum
            }).select('id title videoUrl videoUrlBackup episodeNum').lean();

            if (!episode) {
                return next(new AppError("Oops, sorry we can't find that page!", 404));
            }

            try {
                episode.tempVideoUrl = await getVideoSource(episode.videoUrl);
                episode.oe = parseInt(new URL(episode.tempVideoUrl).searchParams.get('oe'), 16) * 1000;
                logger.info(`Set key into redis`);
                await cache.set(episodeKey, JSON.stringify(episode));
            } catch (err) {
                logger.error({
                    message: err.message,
                    _anime_id: anime._id,
                    _episodeNum: episodeNum,
                    reponse: err.response.data
                });
            }
        }
        const genreList = anime.genres;
        res.status(200).render('anime-watching', {
            title: `${anime.title.replace(/(?:^|\s|[-"'([{.])+\S/g, (c) => c.toUpperCase())} - Tập ${episodeNum}`,
            genres, episode, anime, genreList, topMostViewsDay, topMostViewsWeek, topMostViewsMonth
        });
    } catch (err) {
        next(err);
    }
}

exports.getGenre = async (req, res, next) => {
    try {
        const genres = await getGenres();

        let genre;
        genres.forEach(element => {
            if (element.slug === req.params.genre) {
                genre = element;
            }
        });
        if (!genre) {
            return next(new AppError("Oops, sorry we can't find that page!", 404))
        }

        let page;
        if (!req.params.page) {
            page = 1
        } else if (!/^trang-[1-9]+/.test(req.params.page)) {
            return next(new AppError("Oops, sorry we can't find that page!", 404));
        } else {
            page = req.params.page.split('-')[1];
        }

        const [topMostViewsDay, topMostViewsWeek, topMostViewsMonth] = await getTopMostViews();
        const query = Anime
            .find({genres: genre._id})
            .select('title slug image runningTime updatedAt quality releaseYear')
            .sort({releaseYear: -1, updatedAt: -1})
            .lean();

        const options = {
            page: page,
            limit: 20,
            collation: {
                locale: 'en',
            },
        }
        const result = await Anime.paginate(query, options);
        const animeList = result.docs;

        res.status(200).render('categories', {
            title: 'Danh sách Anime',
            genres,
            genre,
            animeList,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            totalPages: result.totalPages,
            currentPage: page,
            topMostViewsDay,
            topMostViewsWeek,
            topMostViewsMonth
        });
    } catch (err) {
        next(err);
    }
}

exports.search = async (req, res, next) => {
    try {
        const keyword = req.params.keyword ? req.params.keyword : '';

        const genresPromise = getGenres();
        const animeListPromise = Anime
            .find({title: {$regex: `^${keyword}.*`}})
            .select('title quality slug image runningTime releaseYear updatedAt')
            .sort({releaseYear: -1, updatedAt: -1})
            .limit(20)
            .lean();

        const [genres, animeList] = await Promise.all([genresPromise, animeListPromise]);
        const [topMostViewsDay, topMostViewsWeek, topMostViewsMonth] = await getTopMostViews();

        res.status(200).render('search', {
            title: 'Anime Vietsub Online',
            genres,
            animeList,
            keyword,
            topMostViewsDay,
            topMostViewsWeek,
            topMostViewsMonth
        });
    } catch (err) {
        next(err);
    }
}

const getGenres = async () => {
    const cacheResults = await cache.get('genres');
    if (cacheResults) {
        logger.info('Cache hit with key: genres');
        return JSON.parse(cacheResults);
    }

    logger.info('Cache miss with key: genres');
    const genres = await Genre.find().select('name slug').lean();
    if (genres) {
        logger.info(`Set key into redis`);
        await cache.set('genres', JSON.stringify(genres));
    }
    return genres;
}

const getVideoSource = async (videoUrl) => {
    const videoId = videoUrl.split('/').pop();
    const pageId = videoUrl.split('/')[3];

    let fbAcessToken = process.env.FB_PAGE_ACCESS_TOKEN_MEOW_MEOW;
    if(pageId != process.env.FB_PAGE_ID_MEOW_MEOW) {
        fbAcessToken = process.env.FB_PAGE_ACCESS_TOKEN_UPLOAD_PRO;
    }

    logger.info(`Start get video source with id: ${videoId}, page id: ${pageId}`);
    const response = await axios.get(`${process.env.FB_API_HOST}/${videoId}`, {
        params: {
            fields: 'source',
            access_token: fbAcessToken
        }
    });
    return response.data.source;
}

const getTopMostViews = async () => {
    let topMostViewsDay, topMostViewsWeek, topMostViewsMonth;

    const cachetTopMostViewsDayPromise = cache.get('top-most-views-day');
    const cachetTopMostViewsWeekPromise = cache.get('top-most-views-week');
    const cachetTopMostViewsMonthPromise = cache.get('top-most-views-month');

    const [cachetTopMostViewsDay, cachetTopMostViewsWeek, cachetTopMostViewsMonth] = await Promise.all([
        cachetTopMostViewsDayPromise,
        cachetTopMostViewsWeekPromise,
        cachetTopMostViewsMonthPromise
    ]);

    if (cachetTopMostViewsDay) topMostViewsDay = JSON.parse(cachetTopMostViewsDay);
    if (cachetTopMostViewsWeek) topMostViewsWeek = JSON.parse(cachetTopMostViewsWeek);
    if (cachetTopMostViewsMonth) topMostViewsMonth = JSON.parse(cachetTopMostViewsMonth);

    return [topMostViewsDay, topMostViewsWeek, topMostViewsMonth];
}