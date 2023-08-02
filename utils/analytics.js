// Imports the Google Analytics Data API client library.
const {BetaAnalyticsDataClient} = require('@google-analytics/data');
const axios = require('axios');
const Anime = require('../models/animeModel');
const cache = require('./cache');

// Using a default constructor instructs the client to use the credentials
// specified in GOOGLE_APPLICATION_CREDENTIALS environment variable.
const analyticsDataClient = new BetaAnalyticsDataClient();

async function runReportGoogleAnalytics(startDate, endDate) {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`,
        dateRanges: [
            {
                startDate: startDate,
                endDate: endDate,
            },
        ],
        dimensions: [
            {
                name: 'customEvent:page_path'
            }
        ],
        metrics: [
            {
                name: 'eventCount',
            },
        ],
        dimensionFilter: {
            filter: {
                fieldName: 'customEvent:page_path',
                stringFilter: {
                    matchType: 'BEGINS_WITH',
                    value: '/watch',
                    caseSensitive: false
                }
            }
        },
        limit: 10,
        offset: 0
    });
    return response;
}

async function getAccessToken() {
    const res = await axios.post('https://animeow.piwik.pro/auth/token', {
        grant_type: 'client_credentials',
        client_id: process.env.PIWIK_CLIENT_ID,
        client_secret: process.env.PIWIK_CLIENT_SECRET
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return res.data.access_token;
}

async function runReportPiwik(startDate, endDate) {
    const accessToken = await getAccessToken();
    const res = await axios.post('https://animeow.piwik.pro/api/analytics/v1/query/', {
        'date_from': startDate,
        'date_to': endDate,
        'website_id': '3b21adac-7d02-4903-a29c-cbf6102135e3',
        'offset': 0,
        'limit': 10,
        'columns': [
            {
                'column_id': 'event_custom_dimension_1'
            },
            {
                'column_id': 'page_views'
            }
        ],
        'order_by': [
            [
                1,
                'desc'
            ]
        ],
        'filters': null,
        'metric_filters': null
    }, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return res.data.data;
}

module.exports.getTopMostViews = async function () {
    let topMostViewsDay;
    let topMostViewsWeek;
    let topMostViewsMonth;

    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

    const resDay = await runReportGoogleAnalytics('yesterday', 'today');
    const resWeek = await runReportGoogleAnalytics('7daysAgo', 'today');
    const resMonth = await runReportGoogleAnalytics('30daysAgo', 'today');

    topMostViewsDay = await resToAnimeList(resDay);
    topMostViewsWeek = await resToAnimeList(resWeek);
    topMostViewsMonth = await resToAnimeList(resMonth);

    if (topMostViewsDay && topMostViewsWeek && topMostViewsMonth) {
        if (topMostViewsDay.length > 1 && topMostViewsWeek.length > 1 && topMostViewsMonth.length > 1) {
            await cache.set('top-most-views-day', JSON.stringify(topMostViewsDay));
            await cache.set('top-most-views-week', JSON.stringify(topMostViewsWeek));
            await cache.set('top-most-views-month', JSON.stringify(topMostViewsMonth));
            await cache.set('top-most-views-last-updated', Date.now());
        }
    }
}

async function resToAnimeList(res) {
    let topMostViewsList = [];

    if(res.rows) {
        for (let i = 0; i < res.rows.length; i++) {
            if (res.rows[i].dimensionValues[0].value.split('/').length > 2) {
                let anime = await Anime.findOne({slug: res.rows[i].dimensionValues[0].value.split('/')[2]}).select('title image slug').lean();
                if (anime) {
                    anime.views = res.rows[i].metricValues[0].value;
                    topMostViewsList.push(anime);
                }
            }
        }
    } else if(res) {
        for (let i = 0; i < res.length; i++) {
            if (res[i][0].split('/').length > 2) {
                let anime = await Anime.findOne({slug: res[i][0].split('/')[2]}).select('title image slug').lean();
                if (anime) {
                    anime.views = res[i][1];
                    topMostViewsList.push(anime);
                }
            }
        }
    }

    return topMostViewsList;
}


