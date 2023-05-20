const request = require('supertest');
const assert = require('assert');

const app = require('../app');
const db = require('./db');
const cache = require('../utils/cache');
const Anime = require('../models/animeModel');
const Episode = require('../models/episodeModel');
const testData = require('./testData');

before(async function () {
    await db.connect();
});


afterEach(async function () {
    await db.clear();
});

after(async function () {
    await db.close();
});

describe('Episodes', function () {
    /*
     * Test the /POST route
     */
    describe('/POST episodes', function () {
        it('it should POST a episode without error', async function () {
            const anime = await Anime.create(testData.anime);
            let episodeData = JSON.parse(JSON.stringify(testData.episode));
            episodeData.anime = anime._id;
            const res = await request(app).post('/api/v1/episodes').send(episodeData);
            assert.equal(res.statusCode, 201);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.title, 'Yui Hatano');
            assert.equal(res._body.data.episodeNum, 1);
            assert.equal(res._body.data.sources[0].src, 'Yua Mikami');
            assert.equal(res._body.data.sources[0].label, '720 P');
        });

        it('it not should POST a episode without a anime id', async function () {
            const res = await request(app).post('/api/v1/episodes').send(testData.episodeWithoutAnimeId);
            assert.equal(res.statusCode, 400);
        });

        it('it should increment episode count by one when create a new episode', async function () {
            const anime = await Anime.create(testData.anime);
            let episodeData = JSON.parse(JSON.stringify(testData.episode));
            episodeData.anime = anime._id;
            await request(app).post('/api/v1/episodes').send(episodeData);

            const updatedAnime = await Anime.findById(anime._id);
            assert.equal(anime.episodeCount, 0);
            assert.equal(updatedAnime.episodeCount, 1);
        });

        it('it should DELETE redis cache when CREATE a new episode', async function () {
            const anime = await Anime.create(testData.anime);
            assert.equal(anime.episodeCount, 0);
            await cache.set(anime.slug, JSON.stringify(anime));
            await cache.set(`episode:${anime.slug}`, JSON.stringify(anime));
            await cache.set('anime:anime-list', JSON.stringify(anime));
            await cache.set('anime:anime-list-upcoming', JSON.stringify(anime));
            await cache.set('anime:anime-list-recently-added', JSON.stringify(anime));
            let episodeData = JSON.parse(JSON.stringify(testData.episode));
            episodeData.anime = anime._id;
            await request(app).post('/api/v1/episodes').send(episodeData);
            const cacheResult = await cache.get(`anime:${anime.slug}`);
            const cacheAnimeListResult = await cache.get('anime:anime-list');
            const cacheAnimeListUpcomingResult = await cache.get('anime:anime-list-upcoming');
            const cacheAnimeListRecentlyAddedResult = await cache.get('anime:anime-list-recently-added');
            const cacheEpisodeListResult = await cache.get(`episode:${anime.slug}`);
            assert.equal(cacheResult, null);
            assert.equal(cacheAnimeListResult, null);
            assert.equal(cacheAnimeListUpcomingResult, null);
            assert.equal(cacheAnimeListRecentlyAddedResult, null);
            assert.equal(cacheEpisodeListResult, null);
        });
    });
    /*
     * Test the /GET/:id route
     */
    describe('/GET/:id episodes', function () {
        it('it should GET a episode by the given id', async function () {
            const anime = await Anime.create(testData.anime);
            let episodeData = JSON.parse(JSON.stringify(testData.episode));
            episodeData.anime = anime._id;
            const episode = await Episode.create(episodeData);
            const res = await request(app).get(`/api/v1/episodes/${episode._id}`);
            assert.equal(res.statusCode, 200);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.title, 'Yui Hatano');
            assert.equal(res._body.data.episodeNum, 1);
            assert.equal(res._body.data.sources[0].src, 'Yua Mikami');
            assert.equal(res._body.data.sources[0].label, '720 P');
        });
    });
    /*
     * Test the /PATCH/:id route
     */
    describe('/PATCH/:id episodes', function () {
        it('it should UPDATE a episode by the given id', async function () {
            const anime = await Anime.create(testData.anime);
            let episodeData = JSON.parse(JSON.stringify(testData.episode));
            episodeData.anime = anime._id;
            const episode = await Episode.create(episodeData);
            const res = await request(app).patch(`/api/v1/episodes/${episode._id}`).send({title: "Saori Hara"});
            assert.equal(res.statusCode, 200);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.title, 'Saori Hara');
            assert.equal(res._body.data.episodeNum, 1);
            assert.equal(res._body.data.sources[0].src, 'Yua Mikami');
            assert.equal(res._body.data.sources[0].label, '720 P');
        });

        it('it should DELETE redis cache when UPDATE episode', async function () {
            const anime = await Anime.create(testData.anime);
            let episodeData = JSON.parse(JSON.stringify(testData.episode));
            episodeData.anime = anime._id;
            const episode = await Episode.create(episodeData);
            const episodeKey = `episode:${episode._id}`;
            await cache.set(episodeKey, JSON.stringify(episode));
            const res = await request(app).patch(`/api/v1/episodes/${episode._id}`).send({title: "Saori Hara"});
            assert.equal(res.statusCode, 200);
            const cacheResult = await cache.get(episodeKey);
            assert.equal(cacheResult, null);
        });
    });

    /*
     * Test the /DELETE/:id route
     */
    describe('/DELETE/:id episodes', function () {
        it('it should DELETE a episode by the given id', async function () {
            const anime = await Anime.create(testData.anime);
            let episodeData = JSON.parse(JSON.stringify(testData.episode));
            episodeData.anime = anime._id;
            const episode = await Episode.create(episodeData);
            const res = await request(app).delete(`/api/v1/episodes/${episode._id}`);
            assert.equal(res.statusCode, 204);

            const result = await Episode.find({_id: episode._id});
            assert.equal(result.length, 0);
        });

        it('it should DELETE redis cache when episode removed', async function () {
            const anime = await Anime.create(testData.anime);
            let episodeData = JSON.parse(JSON.stringify(testData.episode));
            episodeData.anime = anime._id;
            const episode = await Episode.create(episodeData);
            const episodeKey = `episode:${episode._id}`;
            await cache.set(episodeKey, JSON.stringify(episode));
            await cache.set(`episode:${anime.slug}`, JSON.stringify(anime));
            await cache.set('anime:anime-list', JSON.stringify(episode));
            await cache.set('anime:anime-list-upcoming', JSON.stringify(episode));
            await cache.set('anime:anime-list-recently-added', JSON.stringify(episode));
            const res = await request(app).delete(`/api/v1/episodes/${episode._id}`);
            assert.equal(res.statusCode, 204);

            const result = await Episode.find({_id: episode._id});
            assert.equal(result.length, 0);

            const cacheResult = await cache.get(episodeKey);
            const cacheAnimeListResult = await cache.get('anime:anime-list');
            const cacheAnimeListUpcomingResult = await cache.get('anime:anime-list-upcoming');
            const cacheAnimeListRecentlyAddedResult = await cache.get('anime:anime-list-recently-added');
            const cacheEpisodeListResult = await cache.get(`episode:${anime.slug}`);
            assert.equal(cacheResult, null);
            assert.equal(cacheAnimeListResult, null);
            assert.equal(cacheAnimeListUpcomingResult, null);
            assert.equal(cacheAnimeListRecentlyAddedResult, null);
            assert.equal(cacheEpisodeListResult, null);
        });
    });
});
