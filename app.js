const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv')
dotenv.config()



const { Sequelize, DataTypes } = require('sequelize');

const BASE_URL = 'https://www.imdb.com';
const IMAGES_DIR = path.join(__dirname, 'images');

// Define the database connection
console.log(process.env.DB_PASSWORD)

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

// Define the Movie model
const Movie = sequelize.define('Movie', {
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Create the 'images' directory if it doesn't exist
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR);
}

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
            const imageRelativeUrl = $(el).find('.posterColumn img').attr('src');
            const imageUrl = `${BASE_URL}${imageRelativeUrl}`;
            const imageExtension = path.extname(imageUrl);
            const imageName = `${title} (${year})${imageExtension}`;
            const imagePath = path.join(IMAGES_DIR, imageName);

            topMovies.push({ rank, title, year, rating, imageUrl });

            // Download and save image to file system
            axios.get(imageRelativeUrl, { responseType: 'stream' })
                .then(response => {
                    const writer = fs.createWriteStream(imagePath);
                    response.data.pipe(writer);

                    // Save the movie to the database
                    Movie.sync();
                    Movie.create({ rank, title, year, rating, imageUrl })
                        .then(movie => {
                            console.log(`Movie ${movie.title} saved to database`);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                });
        });

        console.log(topMovies);
    })
    .catch(error => {
        console.log(error);
    });
