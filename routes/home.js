const express = require('express');
const db_helper = require("../helpers/db_helper");
const router = express.Router();

router.get('/', function(req, res) {
    res.render('home', {
        test : req.ip
    });
});

router.get('/metrics', function(req, res) {
    db_helper.metrics_canary().then(body => {
        console.log(body.results.length)
        if(body.results.length >= 1){
            res.send(body)
        } else {
            res.status(503).send("No results available.")
        }
    }).catch(console.error);
});

module.exports = router;