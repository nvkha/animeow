const axios = require('axios');


async function getAccessToken() {
    const res = await axios.post('https://animeow.piwik.pro/auth/token', {
        grant_type: 'client_credentials',
        client_id: '6XFtdOUIsZX2pyDYnV1lEVwlYETMnTx4',
        client_secret: 'oFUsr2UbH1prbvzk8PKR3a1MGIdZvYDZpdctyR7NySAwz3dDNyUudQOcyGnOVeZO8bnknSON5TGwmkza'
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return res.data.access_token;
}

async function runReport(startDate, endDate) {
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
    console.log(res.data.data);
}

runReport('2023-06-06', '2023-06-06');
