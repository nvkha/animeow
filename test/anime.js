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
})


afterEach(async function () {
    await db.clear();
})

after(async function () {
    await db.close();
});

describe('Animes', function () {
    /*
     * Test the /GET/:id route
     */
    describe('/GET animes', function () {
        it('it should get all anime', async function () {
            const res = await request(app).get('/api/v1/animes')
            assert.equal(res.statusCode, 200);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.length, 0);
        });
    });
    /*
     * Test the /POST route
     */
    describe('/POST animes', function () {
        it('it should POST an anime without error', async function () {
            const res = await request(app).post('/api/v1/animes').send(testData.anime);
            assert.equal(res.statusCode, 201);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.title, 'Diabolik lovers');
            assert.equal(res._body.data.slug, 'diabolik-lovers');
            assert.equal(res._body.data.type, 'tv');
            assert.equal(res._body.data.episodeCount, 0);
            assert.equal(res._body.data.quality, 'SD');
            assert.equal(res._body.data.active, true);
            assert.equal(res._body.data.otherTitle, 'Diabolik lovers');
            assert.equal(res._body.data.description, 'Test');
            assert.equal(res._body.data.episodeCount, 0);
            assert.equal(res._body.data.releaseYear, 2013);
            assert.equal(res._body.data.image, 'dbUtIKc.jpg');
            assert.equal(res._body.data.transTeam, 'Yamisora');
        });

        it('it not should POST a anime without a title', async function () {
            const res = await request(app).post('/api/v1/animes').send(testData.animeWithoutTitle);
            assert.equal(res.statusCode, 400);
        });
    });
    /*
     * Test the /GET/:id route
     */
    describe('/GET/:id animes', function () {
        it('it should GET an anime by the given id', async function () {
            const doc = await Anime.create(testData.anime);
            const res = await request(app).get(`/api/v1/animes/${doc._id}`);
            assert.equal(res.statusCode, 200);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.title, 'Diabolik lovers');
            assert.equal(res._body.data.slug, 'diabolik-lovers');
            assert.equal(res._body.data.type, 'tv');
            assert.equal(res._body.data.episodeCount, 0);
            assert.equal(res._body.data.quality, 'SD');
            assert.equal(res._body.data.active, true);
            assert.equal(res._body.data.otherTitle, 'Diabolik lovers');
            assert.equal(res._body.data.description, 'Test');
            assert.equal(res._body.data.episodeCount, 0);
            assert.equal(res._body.data.releaseYear, 2013);
            assert.equal(res._body.data.image, 'dbUtIKc.jpg');
            assert.equal(res._body.data.transTeam, 'Yamisora');
        });
    });
    /*
     * Test the /PATCH/:id route
     */
    describe('/PATCH/:id animes', function () {
        it('it should UPDATE an anime by the given id', async function () {
            const doc = await Anime.create(testData.anime);
            const res = await request(app).patch(`/api/v1/animes/${doc._id}`).send({title: "Yua Mikami"});
            assert.equal(res.statusCode, 200);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.title, 'Yua Mikami');
            assert.equal(res._body.data.slug, 'yua-mikami');
            assert.equal(res._body.data.type, 'tv');
            assert.equal(res._body.data.episodeCount, 0);
            assert.equal(res._body.data.quality, 'SD');
            assert.equal(res._body.data.active, true);
            assert.equal(res._body.data.otherTitle, 'Diabolik lovers');
            assert.equal(res._body.data.description, 'Test');
            assert.equal(res._body.data.episodeCount, 0);
            assert.equal(res._body.data.releaseYear, 2013);
            assert.equal(res._body.data.image, 'dbUtIKc.jpg');
            assert.equal(res._body.data.transTeam, 'Yamisora');
        });

        it('it should DELETE redis cache when UPDATE an anime', async function () {
            const doc = await Anime.create(testData.anime);
            await cache.set(doc.slug, JSON.stringify(doc.toObject()));
            await cache.set('anime:anime-list', JSON.stringify(doc.toObject()));
            await cache.set('anime:anime-list-upcoming', JSON.stringify(doc.toObject()));
            await cache.set('anime:anime-list-recently-added', JSON.stringify(doc.toObject()));
            await request(app).patch(`/api/v1/animes/${doc._id}`).send({otherTitle: "Yua Mikami", description: 'I love Yua Mikami'});
            const cacheResult = await cache.get('anime:' + doc.slug);
            const cacheAnimeListResult = await cache.get('anime:anime-list');
            const cacheAnimeListUpcomingResult = await cache.get('anime:anime-list-upcoming');
            const cacheAnimeListRecentlyAddedResult = await cache.get('anime:anime-list-recently-added');
            assert.equal(cacheResult, null);
            assert.equal(cacheAnimeListResult, null);
            assert.equal(cacheAnimeListUpcomingResult, null);
            assert.equal(cacheAnimeListRecentlyAddedResult, null);
        });
    });
    /*
     * Test the /DELETE/:id route
     */
    describe('/DELETE/:id animes', function () {
        it('it should DELETE an anime by the given id', async function () {
            const doc = await Anime.create(testData.anime);
            const res = await request(app).delete(`/api/v1/animes/${doc._id}`);
            assert.equal(res.statusCode, 204);
        });

        it('it should DELETE all episode when anime removed', async function () {
            const doc = await Anime.create(testData.anime);
            const res = await request(app).delete(`/api/v1/animes/${doc._id}`);
            assert.equal(res.statusCode, 204);

            const result = await Episode.find({anime: doc._id});
            assert.equal(result.length, 0);
        });

        it('it should DELETE redis cache when anime removed', async function () {
            const doc = await Anime.create(testData.anime);
            await cache.set(doc.slug, JSON.stringify(doc));
            await cache.set('anime:anime-list', JSON.stringify(doc));
            await cache.set('anime:anime-list-upcoming', JSON.stringify(doc));
            await cache.set('anime:anime-list-recently-added', JSON.stringify(doc));
            const res = await request(app).delete(`/api/v1/animes/${doc._id}`);
            assert.equal(res.statusCode, 204);

            const cacheResult = await cache.get('anime:' + doc.slug);
            const cacheAnimeListResult = await cache.get('anime:anime-list');
            const cacheAnimeListUpcomingResult = await cache.get('anime:anime-list-upcoming');
            const cacheAnimeListRecentlyAddedResult = await cache.get('anime:anime-list-recently-added');
            assert.equal(cacheResult, null);
            assert.equal(cacheAnimeListResult, null);
            assert.equal(cacheAnimeListUpcomingResult, null);
            assert.equal(cacheAnimeListRecentlyAddedResult, null);
        });
    });
});