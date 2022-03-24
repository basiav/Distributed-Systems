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
let chosenNewspaper;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {welcomeTitle: title, newspapers: newspapers});
  next()
});

/* POST newspapers requests by country name */
router.post('/postCountryRequest', (req, res) => {
  country = req.body.country;
  articles = [];

  loadNewsByCountry(req, res)
    .then(res => {
        let msg = "\nArticles successfully fetched. Response: " + res + " \nArticles number: " + articles.length + " \n";
        logMessage("[POST] [/postCountryRequest]", msg, "success");
    })
    .catch(err => {
        let msg = "\n[POST] ERROR: " + err;
        logMessage("[POST] [/postCountryRequest]", msg, "error");
    });
})

/* POST newspapers requests by Newspaper name */
router.post('/postNewspaperRequest', (req, res) => {
    chosenNewspaper = req.body.n;
    country = req.body.country;
    articles = [];

    loadNewsByNewspaperName(req, res)
        .then(res => {
            let msg = "\nArticles successfully fetched for Newspaper name: " + chosenNewspaper +".\nResponse: " + res + " \nArticles number: " + articles.length + " \n";
            logMessage("[POST] [/postNewspaperRequest]", msg, "success");
        })
        .catch(err => {
            let msg = "\n[POST] ERROR: " + err;
            logMessage("[POST] [/postNewspaperRequest]", msg, "error");
        });
})

/* returns an array of promises, where each promise corresponds to a different newspaper URL */
function loadNewsByCountryPromises(){
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
                    let msg = "\n[loadNewsByCountryPromises] ERROR: " + err;
                    logMessage("[loadNewsByCountryPromises] ", msg, "error");
                    reject("Error: ", err);
                });
        });
        newspaperPromises.push(promise);
    });
    return newspaperPromises;
}

/* returns an array of promises, where each promise corresponds to a different newspaper URL */
function loadNewsByNamePromises(){
    console.log("CHOSEN NEWSPAPER")
    const newspaperPromises = [];
    newspapers
        .filter(newspaper => newspaper.name === chosenNewspaper)
        .forEach(newspaper => {
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
                        let msg = "\n[loadNewsByNamePromises] ERROR: " + err;
                        logMessage("[loadNewsByNamePromises] ", msg, "error");
                        reject("Error: ", err);
                    });
            });
            newspaperPromises.push(promise);
        });
    return newspaperPromises;
}

/* Loads data to the articles array */
async function loadNewsByCountry(req, res) {
    let newspaperPromises = loadNewsByCountryPromises(req, res);
    console.log("Loading news for country ... ", country);

    for (const promise of newspaperPromises) {
        try {
            await promise;
        } catch (err) {
            let msg = "\n[loadNewsByCountry] ERROR: " + err;
            logMessage("[loadNewsByCountry] ", msg, "error");
        }
    }

    res.render('articles', {country: req.body.country, articles: articles});
    console.log("ARTICLES", articles);
}

/* Loads data to the articles array */
async function loadNewsByNewspaperName(req, res) {
    let newspaperPromises = loadNewsByNamePromises(req, res);
    console.log("Loading news for Newspaper ... ", chosenNewspaper);

    for (const promise of newspaperPromises) {
        try {
            await promise;
        } catch (err) {
            let msg = "\n[loadNewsByNewspaperName] ERROR: " + err;
            logMessage("[loadNewsByNewspaperName] ", msg, "error");
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
