// Imports the Google Analytics Data API client library.
const {BetaAnalyticsDataClient} = require('@google-analytics/data');
const Anime = require('../models/animeModel');
const cache = require('./cache');

// Using a default constructor instructs the client to use the credentials
// specified in GOOGLE_APPLICATION_CREDENTIALS environment variable.
const analyticsDataClient = new BetaAnalyticsDataClient();

async function runReport(startDate, endDate) {
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

module.exports.getTopMostViews = async function () {
    let topMostViewsDay;
    let topMostViewsWeek;
    let topMostViewsMonth;

    const resDay = await runReport('yesterday', 'today');
    const resWeek = await runReport('7daysAgo', 'today');
    const resMonth = await runReport('30daysAgo', 'today');

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

    for (let i = 0; i < res.rows.length; i++) {
        if (res.rows[i].dimensionValues[0].value.split('/').length > 2) {
            let anime = await Anime.findOne({slug: res.rows[i].dimensionValues[0].value.split('/')[2]}).select('title image slug').lean();
            if (anime) {
                anime.views = res.rows[i].metricValues[0].value;
                topMostViewsList.push(anime);
            }
        }
    }

    return topMostViewsList;
}