const express = require('express');
const axios = require("axios");
const cheerio = require("cheerio");
const request = require("request");
// const livereload = require("livereload");
const router = express.Router();
const locals = require("express/lib/application").locals;

let title = "Welcome to NewspaperAPI";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {welcomeTitle: title});
  next()
});

let country;

router.post('/postCountryRequest', (req, res) => {
  // res.render('index', {welcomeTitle: req.body.country});
  country = req.body.country;
  articles = [];
  // console.log("RES DATA: ", res.data);
  // loadNews()
  //     .then(() => {
  //     console.log("ARTICLES for country: ", country, articles);
  //     console.log("Articles length: ", articles.length);
  //     res.render('articles', {country: req.body.country, articles: articles});
  //     })
  //     .catch(err => {
  //         console.log("ERROR: ", err);
  //     });
  // res.render('index', {welcomeTitle: title});
    loadNews(req, res);
})

const newspapers = [
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/world/ukraine',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/international',
        base: ''
    },
    {
        name: 'the times',
        address: 'https://www.thetimes.co.uk/',
        base: 'https://www.thetimes.co.uk'
    }
]
let articles = []

// function getNewspaperPromise

function loadNewsPromises(){
    const newspaperPromises = [];
    newspapers.forEach(newspaper => {
        let promise = new Promise((resolve, reject) => {
            axios.get(newspaper.address)
                .then(response => {
                    const html = response.data
                    const $ = cheerio.load(html)

                    $("a:contains('" + country + "')", html).each(function () {
                        // console.log($(this).text())
                        const title = $(this).text()
                        const url = $(this).attr('href')

                        articles.push({
                            title,
                            url: newspaper.base + url,
                            source: newspaper.name
                        });

                    });
                    resolve();
                })
                .catch((err) => {
                    console.log("Error: ", err)
                    reject("Error: ", err);
                });
        });
        newspaperPromises.push(promise);
    });
    return newspaperPromises;
}

function fun() {
    axios.get('ws://localhost:3000')
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            // console.log("HTML", html)
            // $('h1.title').text('Hi')
            // $('h1.title', html).text("Hi")
            $('.welcome').each((i, el) => {
                console.log("i: ", i);
                const title = $(el)
                    .text();

                $(el).html("Hi")
                console.log("[Before] ", title, " [After] ", $(el).text());
            });
            console.log($('h1').text());
            title = $('h1').text();
        })
        .catch(e => {
            console.log("ERROR: ", e);
        });
}

async function loadNews(req, res) {
    // await Promise.all([getNews]);
    //   Promise.all([getNews]).then(values => {
    //       console.log("Values: ", values);
    //   });
    let newspaperPromises = loadNewsPromises();
    // Promise.allSettled([newspaperPromises])
    //     .then((results) => {
    //         results.forEach((result) => {
    //             console.log(result.status);
    //         });
    //         console.log("Articles length: ", articles.length);
    //         // res.render('articles', {country: req.body.country, articles: articles});
    // });
    console.log("Loading news for country ... ", country);
    for (const promise of newspaperPromises) {
        await promise;
    }
    res.render('articles', {country: req.body.country, articles: articles});
    console.log("Articles length: ", articles.length);
    console.log("ARTICLES", articles);
}



module.exports = router;
