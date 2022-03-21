var express = require('express');
const axios = require("axios");
const cheerio = require("cheerio");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Hello' });
  res.render('index');
});

const newspapers = [
  {
    name: 'guardian',
    address: 'https://www.theguardian.com/world/ukraine',
    base: ''
  },
]
const articles = []

let getNews = new Promise(() => {
  newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
          const html = response.data
          const $ = cheerio.load(html)

          $('a:contains("Ukraine")', html).each(function () {
            console.log($(this).text())
            const title = $(this).text()
            const url = $(this).attr('href')

            articles.push({
              title,
              url: newspaper.base + url,
              source: newspaper.name
            })
          })

        })
  });
});

module.exports = router;
