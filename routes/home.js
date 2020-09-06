const express = require('express');
const logging = require("../helpers/logging_helper");
const router = express.Router();

router.get('/', function(req, res) {
    logging.append_to_log("opened home page.", req.user ? req.user.displayName : "DEV USER");
    res.render('home', {
        test : req.ip
    });
});

module.exports = router;