const express = require('express');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');

const authController = require('./../controllers/authController');
const Anime = require('./../models/animeModel');
const Genre = require('./../models/genreModel');
const Episode = require('./../models/episodeModel');
const Parameter = require('./../models/parameterModel');


AdminJS.registerAdapter(AdminJSMongoose);
const admin = new AdminJS({
    resources: [{
        resource: Anime, options: {
            listProperties: ['_id', 'title', 'transTeam', 'releaseYear', 'active']
        }
    },
        {resource: Genre},
        {resource: Episode},
        {resource: Parameter}
    ]
});

const router = express.Router();

if (process.env.NODE_ENV === 'production') {
    router.use(authController.protect);
    router.use(authController.restrictTo('admin'));
}


router.use(AdminJSExpress.buildRouter(admin));

module.exports = router;