const request = require('supertest');
const assert = require('assert');

const app = require('../app');
const db = require('./db');
const cache = require('../utils/cache');
const Genre = require('../models/genreModel');
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

describe('Genres', function () {
    /*
     * Test the /GET/:id route
     */
    describe('/GET genres', function () {
        it('it should get all genres', async function () {
            const res = await request(app).get('/api/v1/genres');
            assert.equal(res.statusCode, 200);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.length, 0);
        });
    });
    /*
     * Test the /POST route
     */
    describe('/POST genres', function () {
        it('it should POST a genre without error', async function () {
            const res = await request(app).post('/api/v1/genres').send(testData.genre);
            assert.equal(res.statusCode, 201);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.name, 'Yui Hatano');
            assert.equal(res._body.data.slug, 'yui-hatano');
        });

        it('it not should POST a genre without a name', async function () {
            const res = await request(app).post('/api/v1/genres').send(testData.genreWithoutName);
            assert.equal(res.statusCode, 400);
        });

        it('it not should DELETE redis cache when CREATE a new genre', async function () {
            const genres = await Genre.find();
            await cache.set('genres', JSON.stringify(genres));
            const res = await request(app).post('/api/v1/genres').send(testData.genre);

            const cacheResult = await cache.get('genres');
            assert.equal(cacheResult, null);
        });
    });
    /*
     * Test the /GET/:id route
     */
    describe('/GET/:id genres', function () {
        it('it should GET a genre by the given id', async function () {
            const doc = await Genre.create(testData.genre);
            const res = await request(app).get(`/api/v1/genres/${doc._id}`);
            assert.equal(res.statusCode, 200);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.name, 'Yui Hatano');
            assert.equal(res._body.data.slug, 'yui-hatano');
        });
    });
    /*
     * Test the /PATCH/:id route
     */
    describe('/PATCH/:id genres', function () {
        it('it should UPDATE a genre by the given id', async function () {
            const doc = await Genre.create(testData.genre);
            const res = await request(app).patch(`/api/v1/genres/${doc._id}`).send({name: "Yua Mikami"});
            assert.equal(res.statusCode, 200);
            assert.equal(res._body.status, 'success');
            assert.equal(res._body.data.name, 'Yua Mikami');
            assert.equal(res._body.data.slug, 'yua-mikami');
        });

        it('it should DELETE redis cache when UPDATE a genre', async function () {
            const genres = await Genre.find();
            await cache.set('genres', JSON.stringify(genres));
            const doc = await Genre.create(testData.genre);
            const res = await request(app).patch(`/api/v1/genres/${doc._id}`).send({name: "Yua Mikami"});
            assert.equal(res.statusCode, 200);

            const cacheResult = await cache.get('genres');
            assert.equal(cacheResult, null);
        });
    });
    /*
     * Test the /DELETE/:id route
     */
    describe('/DELETE/:id genre', function () {
        it('it should DELETE a genre by the given id', async function () {
            const doc = await Genre.create(testData.genre);
            const res = await request(app).delete(`/api/v1/genres/${doc._id}`);
            assert.equal(res.statusCode, 204);
        });

        it('it should DELETE redis cache when a genre removed', async function () {
            const genres = await Genre.find();
            await cache.set('genres', JSON.stringify(genres));
            const doc = await Genre.create(testData.genre);
            const res = await request(app).delete(`/api/v1/genres/${doc._id}`);
            assert.equal(res.statusCode, 204);

            const cacheResult = await cache.get('genres');
            assert.equal(cacheResult, null);
        });
    });
});