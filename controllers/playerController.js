const Episode = require('./../models/episodeModel');

const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const axios = require('axios');
const cache = require('../utils/cache');
const CryptoJSAesJson = require('../utils/cryptoJSAesJson');
const CryptoJS = require("crypto-js");

exports.getPlayer = async (req, res, next) => {
    try {
        if (req.headers['x-requested-with'] != 'XMLHttpRequest') {
            return res.status(404).send();
        }

        const episodeId = req.body.a;
        const sv = Number(req.body.b);
        const episodeKey = `episode:${episodeId}`

        const episode = await getEpisode(episodeId);
        if (!episode) {
            return res.status(404).send();
        }

        if (episodeId && !sv) {
            let result = '<div class="ps__-title"><i class="fas fa-server mr-2"></i>SERVER:</div>\n' +
                '<div class="ps__-list">\n';

            const idxFb = episode.sources.findIndex(source => source.server === 'fb');
            if (idxFb != -1) {
                result += '<div class="item server-item" data-server-id="1">\n' +
                    '<a href="#" class="btn">#1</a>\n' +
                    '</div>\n';
            }
            const idxLotus = episode.sources.findIndex(source => source.server === 'lotus');
            if (idxLotus != -1) {
                result += '<div class="item server-item" data-server-id="2">\n' +
                    '<a href="#" class="btn">#2</a>\n' +
                    '</div>\n';
            }
            const idxAnime47 = episode.sources.findIndex(source => source.server === 'anime47');
            if (idxAnime47 != -1) {
                result += '<div class="item server-item" data-server-id="3">\n' +
                    '<a href="#" class="btn">#3</a>\n' +
                    '</div>\n';
            }
            const idxVuiGhe = episode.sources.findIndex(source => source.server === 'vuighe');
            if (idxVuiGhe != -1) {
                result += '<div class="item server-item" data-server-id="4">\n' +
                    '<a href="#" class="btn">#4</a>\n' +
                    '</div>\n';
            }
            const idxAbyss = episode.sources.findIndex(source => source.server === 'abyss');
            if (idxAbyss != -1) {
                result += '<div class="item server-item" data-server-id="5">\n' +
                    '<a href="#" class="btn">#5</a>\n' +
                    '</div>\n';
            }
            result += '</div>\n' +
                '<div class="clearfix"></div>'

            return res.status(200).send(result)

        } else if (sv && episodeId) {
            if (sv === 1) {
                const idxFb = episode.sources.findIndex(source => source.server === 'fb');
                const episodeKey = `episode:${episodeId}`

                if (idxFb != -1) {
                    if (episode.sources[idxFb].tempVideoUrl) {
                        if (episode.sources[idxFb].oe <= Date.now()) {
                            logger.info(`Episode video url expired with timestamp: ${episode.sources[idxFb].oe}, current timestamp ${Date.now()}`);
                            try {
                                if (episode.sources[idxFb].status != 'deleted') {
                                    logger.info(`Found facebook source at index: ${idxFb}`);
                                    episode.sources[idxFb].tempVideoUrl = await getVideoSource(episode.sources[idxFb].src);
                                    episode.sources[idxFb].oe = parseInt(new URL(episode.sources[idxFb].tempVideoUrl).searchParams.get('oe'), 16) * 1000;
                                    logger.info('Set key into redis');
                                    await cache.set(episodeKey, JSON.stringify(episode));
                                }
                            } catch (err) {
                                if (err.response && err.response.data) {
                                    if (err.response.data.error.code === 100) {
                                        episode.sources[idxFb].status = 'deleted';
                                        episode.sources[idxFb].tempVideoUrl = null;
                                        logger.info(`Set status deleted into redis`);
                                        await cache.set(episodeKey, JSON.stringify(episode));
                                    }
                                }
                                logger.error({
                                    message: err.message,
                                    _episodeId: episodeId,
                                    _episodeNum: episode.episodeNum,
                                    reponse: err.response.data
                                });
                            }
                        }
                    } else {
                        try {
                            if (episode.sources[idxFb].status != 'deleted') {
                                logger.info(`Found facebook source at index: ${idxFb}`);
                                episode.sources[idxFb].tempVideoUrl = await getVideoSource(episode.sources[idxFb].src);
                                episode.sources[idxFb].oe = parseInt(new URL(episode.sources[idxFb].tempVideoUrl).searchParams.get('oe'), 16) * 1000;
                                logger.info(`Set key into redis`);
                                await cache.set(episodeKey, JSON.stringify(episode));
                            }
                        } catch (err) {
                            if (err.response && err.response.data) {
                                if (err.response.data.error.code === 100) {
                                    episode.sources[idxFb].status = 'deleted';
                                    logger.info(`Set status deleted into redis`);
                                    await cache.set(episodeKey, JSON.stringify(episode));
                                }
                            }
                            logger.error({
                                message: err.message,
                                _episodeId: episodeId,
                                _episodeNum: episode.episodeNum,
                                reponse: err.response.data
                            });
                        }
                    }
                    const src = episode.sources[idxFb].tempVideoUrl === undefined ? '' : episode.sources[idxFb].tempVideoUrl;
                    return res.status(200).send(buildVideoSrc(src, 'video/mp4'))
                }
            } else if (sv === 2) {
                const idxLotus = episode.sources.findIndex(source => source.server === 'lotus');
                if (idxLotus != -1) {
                    const src = episode.sources[idxLotus].src === undefined ? '' : episode.sources[idxLotus].src;
                    return res.status(200).send(buildVideoSrc(src, 'application/x-mpegURL'));
                }
            } else if (sv === 3) {
                const idxAnime47 = episode.sources.findIndex(source => source.server === 'anime47');
                if (idxAnime47 != -1) {
                    logger.info(`Found anime47 source at index: ${idxAnime47}`);
                    if (episode.sources[idxAnime47].tempVideoUrl) {
                        if (episode.sources[idxAnime47].oe <= Date.now()) {
                            logger.info(`Anime47 video url expired with timestamp: ${episode.sources[idxAnime47].oe}, current timestamp ${Date.now()}`);
                            try {
                                logger.info(`Found anime47 source at index: ${idxAnime47}`);
                                const episodeIdAnime47 = episode.sources[idxAnime47].src.split("/").at(-1).replace('.html', '');
                                const src = await getAnime47VideoSource(episodeIdAnime47);
                                if (src != null && src != undefined) {
                                    episode.sources[idxAnime47].tempVideoUrl = src;
                                    episode.sources[idxAnime47].oe = parseInt(new URL(episode.sources[idxAnime47].tempVideoUrl).searchParams.get('oe'), 16) * 1000;
                                    logger.info(`Set key into redis`);
                                    await cache.set(episodeKey, JSON.stringify(episode));
                                }
                            } catch (err) {
                                logger.error({
                                    message: err.message,
                                    _episodeId: episodeId,
                                    _episodeNum: episode.episodeNum,
                                });
                            }
                        }
                    } else {
                        try {
                            const episodeIdAnime47 = episode.sources[idxAnime47].src.split("/").at(-1).replace('.html', '');
                            const src = await getAnime47VideoSource(episodeIdAnime47);
                            if (src != null && src != undefined) {
                                episode.sources[idxAnime47].tempVideoUrl = src;
                                episode.sources[idxAnime47].oe = parseInt(new URL(episode.sources[idxAnime47].tempVideoUrl).searchParams.get('oe'), 16) * 1000;
                                logger.info(`Set key into redis`);
                                await cache.set(episodeKey, JSON.stringify(episode));
                            }
                        } catch (err) {
                            logger.error({
                                message: err.message,
                                _episodeId: episodeId,
                                _episodeNum: episode.episodeNum,
                            });
                        }
                    }
                    const src = episode.sources[idxAnime47].tempVideoUrl === undefined ? '' : episode.sources[idxAnime47].tempVideoUrl;
                    return res.status(200).send(buildVideoSrc(src, 'video/mp4'));
                }
            } else if (sv === 5) {
                const idxAbyss = episode.sources.findIndex(source => source.server === 'abyss');
                if (idxAbyss != -1) {
                    const src = episode.sources[idxAbyss].src === undefined ? '' : episode.sources[idxAbyss].src;
                    return res.status(200).send(`<iframe id="iframe-embed" src='${src}' frameborder="0" scrolling="no" allowfullscreen></iframe>`);
                }
            } else if (sv === 4) {
                const idxVuiGhe = episode.sources.findIndex(source => source.server === 'vuighe');
                if (idxVuiGhe != -1) {
                    logger.info(`Found vuighe source at index: ${idxVuiGhe}`);
                    if (episode.sources[idxVuiGhe].tempVideoUrl) {
                        if (episode.sources[idxVuiGhe].oe <= Date.now()) {
                            logger.info(`Vuighe video url expired with timestamp: ${episode.sources[idxVuiGhe].oe}, current timestamp ${Date.now()}`);
                            try {
                                logger.info(`Found vuighe source at index: ${idxVuiGhe}`);
                                const res = await getAnimeVuiGhe(episode.sources[idxVuiGhe].src);
                                const src = await getAnimeVuiGheVideoSource(res, episode.sources[idxVuiGhe].src);
                                if (src != null && src != undefined) {
                                    episode.sources[idxVuiGhe].tempVideoUrl = src;
                                    episode.sources[idxVuiGhe].oe = parseInt(new URL(episode.sources[idxVuiGhe].tempVideoUrl).searchParams.get('oe'), 16) * 1000;
                                    logger.info(`Set key into redis`);
                                    await cache.set(episodeKey, JSON.stringify(episode));
                                }
                            } catch (err) {
                                logger.error({
                                    message: err.message,
                                    _episodeId: episodeId,
                                    _episodeNum: episode.episodeNum,
                                });
                            }
                        }
                    } else {
                        try {
                            const res = await getAnimeVuiGhe(episode.sources[idxVuiGhe].src);
                            const src = await getAnimeVuiGheVideoSource(res, episode.sources[idxVuiGhe].src);
                            const sub = await getAnimeVuiGheVideoSub(res, episode.sources[idxVuiGhe].src);
                            if (src != null && src != undefined) {
                                episode.sources[idxVuiGhe].sub = b64EncodeUnicode(sub);
                                episode.sources[idxVuiGhe].tempVideoUrl = src;
                                episode.sources[idxVuiGhe].oe = parseInt(new URL(episode.sources[idxVuiGhe].tempVideoUrl).searchParams.get('oe'), 16) * 1000;
                                logger.info(`Set key into redis`);
                                await cache.set(episodeKey, JSON.stringify(episode));
                            }
                        } catch (err) {
                            logger.error({
                                message: err.message,
                                _episodeId: episodeId,
                                _episodeNum: episode.episodeNum,
                            });
                        }
                    }
                    const src = episode.sources[idxVuiGhe].tempVideoUrl === undefined ? '' : episode.sources[idxVuiGhe].tempVideoUrl;
                    if (episode.sources[idxVuiGhe].sub != null && episode.sources[idxVuiGhe].sub != undefined) {
                        return res.status(200).send(buildVideoSrcWithSub(src, 'video/mp4', episode.sources[idxVuiGhe].sub));
                    }
                    return res.status(200).send(buildVideoSrc(src, 'video/mp4'));
                }
            }
        }

        return res.status(404).send();
    } catch (err) {
        next(err);
    }
}

const getEpisode = async (episodeId) => {
    let episode;
    const episodeKey = `episode:${episodeId}`;
    const episodeCacheResult = await cache.get(episodeKey);
    if (episodeCacheResult) {
        logger.info(`Cache hit with key: ${episodeKey}`);
        episode = JSON.parse(episodeCacheResult);
    } else {
        logger.info(`Cache miss with key: ${episodeKey}`);
        episode = await Episode.findOne({_id: episodeId}).lean();
        await cache.set(episodeKey, JSON.stringify(episode));
    }
    return episode;
}

const buildVideoSrc = (src, type) => {
    return '<video style="position: absolute" id=player class="video-js vjs-16-9 vjs-theme-fantasy" playsinline oncontextmenu=return!1>\n' +
        `<source src="${src}" type="${type}">\n` +
        '</video>\n' +
        '<script>videojs("player",{preload:"auto",controls:!0,autoplay:!1,notSupportedMessage:"Tập phim trên server này đã bị lỗi! Bạn vui lòng thông báo cho Admin hoặc chọn server khác(nếu có) nhé! Thank you <3"})</script>'
}


function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded Unicode,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

const buildVideoSrcWithSub = (src, type, sub) => {
    return '<video style="position: absolute" id=player class="video-js vjs-16-9 vjs-theme-fantasy" playsinline oncontextmenu=return!1>\n' +
        `<source src="${src}" type="${type}">\n` +
        `<track kind="subtitles" src="data:text/vtt;base64,${sub}" srclang="vi" default="true" mode="showing">\n` +
        '</video>\n' +
        '<script>videojs("player",{preload:"auto",controls:!0,autoplay:!1,notSupportedMessage:"Tập phim trên server này đã bị lỗi! Bạn vui lòng thông báo cho Admin hoặc chọn server khác(nếu có) nhé! Thank you <3"});</script>'
}

const getAnimeVuiGhe = async (path) => {
    const url = process.env.VUIGHE_API + path;
    const res = await axios.get(url, {
        headers: {
            // "accept": "*/*",
            "x-requested-with": "XMLHttpRequest",
            "Referer": "https://vuighe1.com/kimetsu-no-yaiba/tap-1-tan-ac"
        },
    })
    return res;
}

const getAnimeVuiGheVideoSource = (res, path) => {
    let src;
    const id = path.split('/').at(-2);
    if (res.data.sources.fb.length > 0) {
        src = encodeString(res.data.sources.fb[0].src, parseInt(id) % 100);
        for (let i = 1; i < res.data.sources.fb.length; i++) {
            if (res.data.sources.fb[i].quality === '720p') {
                src = encodeString(res.data.sources.fb[i].src, parseInt(id) % 100);
            }
            if (res.data.sources.fb[i].quality === '1080p') {
                src = encodeString(res.data.sources.fb[i].src, parseInt(id) % 100);
            }
        }
    }

    return src;
}

const getAnimeVuiGheVideoSub = (res) => {
    let sub;
    if (res.data.cue) {
        sub = res.data.cue.vi;
    }
    return sub;
}

const encodeString = (e, t) => {
    let result = "";
    e.toString();
    for (let i = 0; i < e.length; i++) {
        let r = e.charCodeAt(i) ^ t;
        result += String.fromCharCode(r)
    }
    return result;
}

const getAnime47VideoSource = async (episodeId) => {
    const res = await axios.post('https://anime47.com/player/player.php', {
        ID: episodeId, SV: 2,
    }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    });
    let src;
    const arr = /atob\("(.*)"\);var/m.exec(res.data);
    if (arr && arr.length > 0) {
        src = JSON.parse(CryptoJS.AES.decrypt(atob(arr[1]), "caphedaklak", {
            format: CryptoJSAesJson
        }).toString(CryptoJS.enc.Utf8));
    }
    return src;
}

const getVideoSource = async (videoUrl) => {
    const videoId = videoUrl.split('/').pop();
    const pageId = videoUrl.split('/')[3];

    let fbAcessToken;
    if (pageId === process.env.FB_PAGE_ID_MEOW_MEOW) {
        fbAcessToken = process.env.FB_PAGE_ACCESS_TOKEN_MEOW_MEOW;
    } else if (pageId === process.env.FB_PAGE_ID_UPLOAD_PRO) {
        fbAcessToken = process.env.FB_PAGE_ACCESS_TOKEN_UPLOAD_PRO
    } else if (pageId === process.env.FB_PAGE_ID_MEOWW) {
        fbAcessToken = process.env.FB_PAGE_ACCESS_TOKEN_MEOWW
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