const express = require('express');
const axios = require("axios");
const cheerio = require("cheerio");
const request = require("request");
// const livereload = require("livereload");
const router = express.Router();
const locals = require("express/lib/application").locals;
// colouring console.logged font
const clc = require('cli-color');
const config = require("../config");

let title = "Welcome to NewspaperAPI";
let country;
const newspapers = config.newspapers;
let articles = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {welcomeTitle: title});
  next()
});

/* POST newspapers requests by country name */
router.post('/postCountryRequest', (req, res) => {
  country = req.body.country;
  articles = [];

  loadNews(req, res)
    .then(res => {
        let msg = "\nArticles successfully fetched. Response: " + res + " \nArticles number: " + articles.length + " \n";
        logMessage("[POST] [/postCountryRequest]", msg, "success");
    })
    .catch(err => {
        let msg = "\n[POST] ERROR: " + err;
        logMessage("[POST] [/postCountryRequest]", msg, "error");
    });
})

/* returns an array of promises, where each promise corresponds to a different newspaper URL */
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
                    let msg = "\n[loadNewsPromises] ERROR: " + err;
                    logMessage("[loadNewsPromises] ", msg, "error");
                    reject("Error: ", err);
                });
        });
        newspaperPromises.push(promise);
    });
    return newspaperPromises;
}

/* Loads data to the articles array */
async function loadNews(req, res) {
    let newspaperPromises = loadNewsPromises(req, res);
    console.log("Loading news for country ... ", country);

    for (const promise of newspaperPromises) {
        try {
            await promise;
        } catch (err) {
            let msg = "\n[loadNews] ERROR: " + err;
            logMessage("[loadNews] ", msg, "error");
        }
    }

    res.render('articles', {country: req.body.country, articles: articles});
    console.log("ARTICLES", articles);
}

function logMessage(location, msg, status, file) {
    file = file || "index.js";
    switch(status) {
        case "success":
            console.log(clc.green(file, location, msg));
            break;
        case "error":
            console.log(clc.red(file, location, msg));
            break;
        default:
            console.log('[%s] %s %s', file, location, msg);
            break;
    }
}


module.exports = router;
