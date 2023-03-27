const fs = require('fs');
const Anime = require('./../models/animeModel');
const Genre = require('./../models/genreModel');


module.exports.createGenreSitemap = async function() {
    const writeStream = fs.createWriteStream(`${__dirname}/../public/sitemap-genre.xml`, {flags: 'w'});
    writeStream.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">')
    for await (const genre of Genre.find().select('slug').cursor()) {
        console.log(genre.slug)
        writeStream.write('<url>\n' +
            '<loc>https://animeow.pro/the-loai/' + genre.slug + '</loc>\n' +
            '<changefreq>monthly</changefreq>\n' +
            '<priority>0.8</priority>\n' +
            '</url>')
    }
    writeStream.write('</urlset>');
    writeStream.end();
}

module.exports.createAnimeSitemap = async function() {
    const writeStream = fs.createWriteStream('${__dirname}/../public/sitemap-movie.xml', {flags: 'w'});
    writeStream.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">')
    for await (const anime of Anime.find().select('slug releaseYear updatedAt').sort({
        releaseYear: -1,
        updatedAt: -1
    }).cursor()) {
        writeStream.write('<url>\n' +
            '<loc>https://animeow.pro/watch/' + anime.slug + '</loc>\n' +
            '<changefreq>daily</changefreq>\n' +
            '<priority>0.7</priority>\n' +
            '</url>')
    }
    writeStream.write('</urlset>');
    writeStream.end();
}

