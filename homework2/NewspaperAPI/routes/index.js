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
  res.render('index', {welcomeTitle: req.body.country});
  country = req.body.country;
  articles = [];
  // console.log("RES DATA: ", res.data);
  loadNews()
      // .then(() => {
      // console.log("ARTICLES for country: ", country, articles);
      // })
      // .catch(err => {
      //     console.log("ERROR: ", err);
      // });
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
    }
]
let articles = []

// let getNews = new Promise((resolve, reject) => {
//     console.log("GETTING NEWS...");
//     newspapers.forEach(newspaper => {
//     axios.get(newspaper.address)
//         .then(response => {
//           const html = response.data
//           const $ = cheerio.load(html)
//
//           $("a:contains('" + country + "')", html).each(function () {
//             console.log($(this).text())
//             const title = $(this).text()
//             const url = $(this).attr('href')
//
//             articles.push({
//               title,
//               url: newspaper.base + url,
//               source: newspaper.name
//             })
//
//           });
//           console.log("ARTICLES", articles)
//           resolve();
//
//         })
//         .catch((err) => {
//             reject("Error: ", err);
//         });
//   });
// });

function createNews(){
    return new Promise((resolve, reject) => {
        console.log("GETTING NEWS...");
        newspapers.forEach(newspaper => {
            axios.get(newspaper.address)
                .then(response => {
                    const html = response.data
                    const $ = cheerio.load(html)

                    $("a:contains('" + country + "')", html).each(function () {
                        console.log($(this).text())
                        const title = $(this).text()
                        const url = $(this).attr('href')

                        articles.push({
                            title,
                            url: newspaper.base + url,
                            source: newspaper.name
                        })

                    });
                    console.log("ARTICLES", articles)
                    resolve();

                })
                .catch((err) => {
                    reject("Error: ", err);
                });
        });
    });
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
          console.log("[Before] ", title , " [After] ", $(el).text());
        });
        console.log($('h1').text());
        title = $('h1').text();
      })
      .catch(e => {
        console.log("ERROR: ", e);
      });

    // axios.get('ws://localhost:3000')
    //     .then(response => {
    //         const html = response.data;
    //         console.log("HTML ", html)
    //     })
    //     .catch(e => {
    //         console.log("ERROR: ", e);
    //     });
}

// setTimeout(() => {
//     fun();
// }, 2000)

async function loadNews() {
  // await Promise.all([getNews]);
  //   Promise.all([getNews]).then(values => {
  //       console.log("Values: ", values);
  //   });
    await createNews();
    console.log("Loading news for country ... ", country);
}
// loadNews()


//
// // loadNews()
// router.post('/', () => {
//   // console.log("post method called")
//   // loadNews().then(r => console.log("Loaded r", r))
//   const $ = cheerio.load("../views/index.ejs")
//   $('h1').text("Hi")
// })

module.exports = router;
