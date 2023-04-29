const Anime = require('./../models/animeModel');
const Genre = require('./../models/genreModel');
const Episode = require('./../models/episodeModel');
const Parameter = require('./../models/parameterModel');

const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const axios = require('axios');
const cache = require('../utils/cache');

exports.getPrivacyPolicy = async (req, res, next) => {
    try {
        const genres = await getGenres();
        const meta = {
            url: req.protocol + '://' + req.hostname + req.originalUrl,
            description: 'Xem phim anime vietsub online xem trên điện thoại di động và máy tính nhanh nhất. Là một website xem phim anime vietsub miễn phí. Liên tục cập nhật các bộ anime vietsub từ các fansub Việt Nam.',
            keywords: 'animeow, ani meow, animeowpro, anime, anime vietsub, anime viet sub, xem anime, xem anime online, anime miễn phí, anime hay, online anime, xem anime',
            image: 'https://ik.imagekit.io/3q7pewvsl/thumbnail/thumbnail.webp'
        }

        res.status(200).render('privacy-policy', {
            title: 'Privacy Policy', meta, genres
        });
    } catch (err) {
        next(err);
    }
}

exports.test = async (req, res, next) => {
    res.status(200).render('test', {
        title: 'AniMeow - Anime Vietsub Online'
    });
}

exports.getIndex = async (req, res, next) => {
    try {
        const [topMostViewsDay, topMostViewsWeek, topMostViewsMonth] = await getTopMostViews();

        const alertPromise = Parameter.findOne({name: 'alert'}).lean();
        const slideListPromise = Parameter.findOne({name: 'slides'}).lean();
        const genresPromise = getGenres();
        const animeListPromise = getAnimeList();
        const animeListUpcomingPromise = getAnimeListUpcoming();

        const [alert, slideList, genres, animeList, animeListUpcoming] = await Promise.all([
            alertPromise, slideListPromise, genresPromise, animeListPromise, animeListUpcomingPromise]);

        const meta = {
            url: req.protocol + '://' + req.hostname + req.originalUrl,
            description: 'Xem phim anime vietsub online xem trên điện thoại di động và máy tính nhanh nhất. Là một website xem phim anime vietsub miễn phí. Liên tục cập nhật các bộ anime vietsub từ các fansub Việt Nam.',
            keywords: 'animeow, ani meow, animeowpro, anime, anime vietsub, anime viet sub, xem anime, xem anime online, anime miễn phí, anime hay, online anime, xem anime',
            image: 'https://ik.imagekit.io/3q7pewvsl/thumbnail/thumbnail.webp'
        }

        res.status(200).render('index', {
            title: 'AniMeow - Anime Vietsub Online',
            meta, alert, slideList, genres, animeList,
            animeListUpcoming, topMostViewsDay, topMostViewsWeek, topMostViewsMonth
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
        const animeCacheResultPromise = cache.get('anime:' + req.params.slug);

        const [genres, animeCacheResult] = await Promise.all([genresPromise, animeCacheResultPromise]);
        if (animeCacheResult) {
            logger.info(`Cache hit with key: 'anime:' + ${req.params.slug}`);
            anime = JSON.parse(animeCacheResult);
        } else {
            logger.info(`Cache miss with key: ${req.params.slug}`);
            anime = await Anime
                .findOne({slug: req.params.slug})
                .populate({path: 'genres', select: 'name slug'})
                .populate({path: 'relatedAnimeList', select: 'title slug image episodeCount status releaseYear'})
                .lean();
            if (!anime) {
                return next(new AppError("Oops, sorry we can't find that page!", 404));
            }
            logger.info(`Set key into redis`);
            await cache.set('anime:' + req.params.slug, JSON.stringify(anime));
        }

        if (!anime.trailer && anime.episodeCount <= 0) {
            return next(new AppError("Oops, sorry we can't find that page!", 404));
        }

        let episode;
        if (anime.episodeCount > 0) {
            const episodeKey = `episode:${anime._id}/${episodeNum}`;
            const episodeCacheResult = await cache.get(episodeKey);
            if (episodeCacheResult) {
                logger.info(`Cache hit with key: ${episodeKey}`);
                episode = JSON.parse(episodeCacheResult);
                if (episode.oe <= Date.now()) {
                    logger.info(`Episode video url expired with timestamp: ${episode.oe}, current timestamp ${Date.now()}`);
                    try {
                        if (episode.status != 'deleted') {
                            episode.tempVideoUrl = await getVideoSource(episode.sources[0].videoUrl);
                            episode.oe = parseInt(new URL(episode.tempVideoUrl).searchParams.get('oe'), 16) * 1000;
                            logger.info('Set key into redis');
                            await cache.set(episodeKey, JSON.stringify(episode));
                        }
                    } catch (err) {
                        if (err.response && err.response.data) {
                            if (err.response.data.error.code === 100) {
                                episode.status = 'deleted';
                                episode.tempVideoUrl = null;
                                logger.info(`Set status deleted into redis`);
                                await cache.set(episodeKey, JSON.stringify(episode));
                            }
                        }

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
                }).select('id title sources episodeNum').lean();

                if (!episode) {
                    return next(new AppError("Oops, sorry we can't find that page!", 404));
                }

                try {
                    if (episode.status != 'deleted') {
                        episode.tempVideoUrl = await getVideoSource(episode.sources[0].videoUrl);
                        episode.oe = parseInt(new URL(episode.tempVideoUrl).searchParams.get('oe'), 16) * 1000;
                        logger.info(`Set key into redis`);
                        await cache.set(episodeKey, JSON.stringify(episode));
                    }
                } catch (err) {
                    if (err.response && err.response.data) {
                        if (err.response.data.error.code === 100) {
                            episode.status = 'deleted';
                            logger.info(`Set status deleted into redis`);
                            await cache.set(episodeKey, JSON.stringify(episode));
                        }
                    }
                    logger.error({
                        message: err.message,
                        _anime_id: anime._id,
                        _episodeNum: episodeNum,
                        reponse: err.response.data
                    });
                }
            }
        }
        const genreList = anime.genres;

        const titleWithoutEpNum = anime.title;
        const title = `${anime.title} - Tập ${episodeNum}`;
        const meta = {
            url: req.protocol + '://' + req.hostname + req.originalUrl,
            description: anime.otherTitle,
            keywords: `${anime.title},${anime.title} tap ${episodeNum}`,
            image: 'https://ik.imagekit.io/3q7pewvsl/imgur/tr:w-300,h-425/' + anime.image
        }

        res.status(200).render('anime-watching', {
            title: title, meta, genres, episode, anime, genreList,
            titleWithoutEpNum, topMostViewsDay, topMostViewsWeek, topMostViewsMonth
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

        const page = getPage(req.params.page);
        if (!page) {
            return next(new AppError("Oops, sorry we can't find that page!", 404));
        }


        const [topMostViewsDay, topMostViewsWeek, topMostViewsMonth] = await getTopMostViews();
        const result = await getAnimePagination({genres: genre._id}, {releaseYear: -1, updatedAt: -1}, page, 15);
        const animeList = result.docs;

        const meta = {
            url: req.protocol + '://' + req.hostname + req.originalUrl,
            description: 'Tổng hợp danh sách Anime theo từng thể loại.',
            keywords: 'anime, danh sach anime, anime vietsub, animevietsub',
            image: 'https://ik.imagekit.io/3q7pewvsl/thumbnail/thumbnail.webp'
        }

        res.status(200).render('categories', {
            title: 'Danh sách Anime', meta, genres, genre, animeList,
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
            .find({$or: [{$text: {$search: keyword}}, {title: {$regex: keyword}}]})
            .select('title quality slug image episodeCount status releaseYear updatedAt')
            .sort({releaseYear: -1, updatedAt: -1})
            .limit(15)
            .lean();

        const [genres, animeList] = await Promise.all([genresPromise, animeListPromise]);
        const [topMostViewsDay, topMostViewsWeek, topMostViewsMonth] = await getTopMostViews();

        const meta = {
            url: req.protocol + '://' + req.hostname + req.originalUrl,
            description: 'Kết quả tìm kiếm cho: ' + keyword,
            keywords: 'anime, anime vietsub, ' + keyword,
            image: 'https://ik.imagekit.io/3q7pewvsl/thumbnail/thumbnail.webp'
        }

        res.status(200).render('search', {
            title: 'Kết quả tìm kiếm',
            meta,
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

exports.filter = async (req, res, next) => {
    try {
        const genres = await getGenres();
        let filterOptions = {};
        let sortOptions = {releaseYear: -1, updatedAt: -1};
        let page = 1;

        if (req.query.keyword) {
            filterOptions.title = {$regex: `^${req.query.keyword}.*`}
        }

        if (req.query.genre) {
            const genreList = req.query.genre.split(',').map(idx => {
                if (genres.length > idx) {
                    return genres[idx - 1]._id;
                }
            });
            filterOptions.genres = {$all: genreList}
        }

        if (req.query.season) {
            const seasonList = req.query.season.split(',');
            filterOptions.season = {$in: seasonList}
        }

        if (req.query.year) {
            const yearList = req.query.year.split(',');
            filterOptions.releaseYear = {$in: yearList}
        }

        if (req.query.type) {
            const typeList = req.query.type.split(',');
            filterOptions.type = {$in: typeList}
        }

        if (req.query.status) {
            filterOptions.status = req.query.status;
        }

        if (req.query.episodes) {
            if (req.query.episodes === '0-12') filterOptions.episodeCount = {'$lte': 12};
            else if (req.query.episodes === '12') filterOptions.episodeCount = {'$gt': 12};
        }

        if (req.query.sort) {
            if (req.query.sort === 'a-z') sortOptions = {title: 1};
        }

        if (req.query.page) {
            page = req.query.page
        }

        const [topMostViewsDay, topMostViewsWeek, topMostViewsMonth] = await getTopMostViews();
        const result = await getAnimePagination(filterOptions, sortOptions, page, 15);
        const animeList = result.docs;

        const meta = {
            url: req.protocol + '://' + req.hostname + req.originalUrl,
            description: 'Tổng hợp danh sách Anime theo từng thể loại.',
            keywords: 'anime, danh sach anime, anime vietsub, animevietsub',
            image: 'https://ik.imagekit.io/3q7pewvsl/thumbnail/thumbnail.webp'
        }

        const path = req.originalUrl;

        res.status(200).render('filter', {
            title: 'Danh sách Anime',
            meta,
            path,
            genres,
            genre: {},
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

exports.getAllAnime = async (req, res, next) => {
    try {
        const genres = await getGenres();

        const page = getPage(req.params.page);
        if (!page) {
            return next(new AppError("Oops, sorry we can't find that page!", 404));
        }

        const [topMostViewsDay, topMostViewsWeek, topMostViewsMonth] = await getTopMostViews();
        const result = await getAnimePagination({}, {releaseYear: -1, updatedAt: -1}, page, 15);
        const animeList = result.docs;

        const meta = {
            url: req.protocol + '://' + req.hostname + req.originalUrl,
            description: 'Tổng hợp danh sách Anime theo từng thể loại.',
            keywords: 'anime, danh sach anime, danh sach anime, anime vietsub, animevietsub',
            image: 'https://ik.imagekit.io/3q7pewvsl/thumbnail/thumbnail.webp'
        }

        res.status(200).render('anime', {
            title: 'Danh sách Anime',
            meta,
            genres,
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

exports.getMovie = async (req, res, next) => {
    try {
        const genres = await getGenres();

        const page = getPage(req.params.page);
        if (!page) {
            return next(new AppError("Oops, sorry we can't find that page!", 404));
        }

        const [topMostViewsDay, topMostViewsWeek, topMostViewsMonth] = await getTopMostViews();
        const result = await getAnimePagination({type: 'movie'}, {releaseYear: -1, updatedAt: -1}, page, 15);
        const animeList = result.docs;

        const meta = {
            url: req.protocol + '://' + req.hostname + req.originalUrl,
            description: 'Danh sách movie Anime',
            keywords: 'anime, danh sach movie anime, anime vietsub, animevietsub, movie anime',
            image: 'https://ik.imagekit.io/3q7pewvsl/thumbnail/thumbnail.webp'
        }

        res.status(200).render('movie', {
            title: 'Danh sách movie Anime',
            meta,
            genres,
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

exports.login = async (req, res, next) => {
    try {
        const genres = await getGenres();

        const meta = {
            url: req.protocol + '://' + req.hostname + req.originalUrl,
            description: 'Xem phim anime vietsub online xem trên điện thoại di động và máy tính nhanh nhất. Là một website xem phim anime vietsub miễn phí. Liên tục cập nhật các bộ anime vietsub từ các fansub Việt Nam.',
            keywords: 'animeow, ani meow, animeowpro, anime, anime vietsub, anime viet sub, xem anime, xem anime online, anime miễn phí, anime hay, online anime, xem anime',
            image: 'https://ik.imagekit.io/3q7pewvsl/thumbnail/thumbnail.webp'
        }

        res.status(200).render('login', {
            title: 'Login',
            meta,
            genres
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

const getAnimeList = async () => {
    const cacheResults = await cache.get('anime:anime-list');
    if (cacheResults) {
        logger.info('Cache hit with key: anime:anime-list');
        return JSON.parse(cacheResults);
    }

    logger.info('Cache miss with key: anime:anime-list');
    const animeList = await Anime
        .find({status: {$in: ['finished', 'ongoing']}})
        .select('title slug image episodeCount status updatedAt quality releaseYear type')
        .sort({releaseYear: -1, updatedAt: -1})
        .limit(15)
        .lean();
    if (animeList) {
        logger.info(`Set key into redis`);
        await cache.set('anime:anime-list', JSON.stringify(animeList));
    }
    return animeList;
}

const getAnimeListUpcoming = async () => {
    const cacheResults = await cache.get('anime:anime-list-upcoming');
    if (cacheResults) {
        logger.info('Cache hit with key: anime:anime-list-upcoming');
        return JSON.parse(cacheResults);
    }

    logger.info('Cache miss with key: anime:anime-list-upcoming');
    const animeListUpcoming = await Anime
        .find({status: 'upcoming'})
        .select('title slug image episodeCount status updatedAt quality releaseYear type')
        .sort({releaseYear: -1, updatedAt: -1})
        .limit(15)
        .lean();
    if (animeListUpcoming) {
        logger.info(`Set key into redis`);
        await cache.set('anime:anime-list-upcoming', JSON.stringify(animeListUpcoming));
    }
    return animeListUpcoming;
}

const getAnimeListRecentlyAdded = async () => {
    const cacheResults = await cache.get('anime:anime-list-recently-added');
    if (cacheResults) {
        logger.info('Cache hit with key: anime:anime-list-recently-added');
        return JSON.parse(cacheResults);
    }

    logger.info('Cache miss with key: anime:anime-list-recently-added');
    const animeListRecentlyAdded = await Anime
        .find({status: {$in: ['finished', 'ongoing']}})
        .select('title slug image episodeCount status createdAt releaseYear')
        .sort({createdAt: -1})
        .limit(10)
        .lean();
    if (animeListRecentlyAdded) {
        logger.info(`Set key into redis`);
        await cache.set('anime:anime-list-recently-added', JSON.stringify(animeListRecentlyAdded));
    }
    return animeListRecentlyAdded;
}

const getVideoSource = async (videoUrl) => {
    const videoId = videoUrl.split('/').pop();
    const pageId = videoUrl.split('/')[3];

    let fbAcessToken = process.env.FB_PAGE_ACCESS_TOKEN_MEOW_MEOW;
    if (pageId != process.env.FB_PAGE_ID_MEOW_MEOW) {
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

const getAnimePagination = async (filterOptions, sortOptions, page, limit) => {
    const query = Anime.find(filterOptions)

    const options = {
        page: page,
        select: 'title slug image type episodeCount status updatedAt quality releaseYear',
        sort: sortOptions,
        lean: true,
        limit: limit
    }
    const result = await Anime.paginate(query, options);

    return result;
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

const getPage = function (page) {
    if (!page) {
        return 1;
    } else if (!/^trang-[1-9]+/.test(page)) {
        return null;
    }
    return page.split('-')[1];
}