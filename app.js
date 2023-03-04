const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.imdb.com/chart/top/?ref_=nv_mv_250')
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);

        const topMovies = [];

        $('tbody.lister-list tr').each((i, el) => {
            const rank = $(el).find('.posterColumn span[name="ir"]').text();
            const title = $(el).find('.titleColumn a').text();
            const year = $(el).find('.titleColumn span.secondaryInfo').text().replace(/[()]/g, '');
            const rating = $(el).find('.imdbRating strong').text();

            topMovies.push({ rank, title, year, rating });
        });

        console.log(topMovies);
    })
    .catch(error => {
        console.log(error);
    });
