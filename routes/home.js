const express = require('express');
const logging = require("../helpers/db_helper");
const router = express.Router();

router.get('/', function(req, res) {
    res.render('home', {
        test : req.ip
    });
});

module.exports = router;