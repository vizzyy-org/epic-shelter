const express = require('express');
const logging = require("../helpers/logging_helper");
const router = express.Router();

router.get('/', function(req, res) {
    logging.append_to_log("opened users page.", req.user ? req.user.displayName : "DEV USER");
    res.render('users', {
        userProfile: req.user,
        userProfileParsed: JSON.stringify(req.user, null, 2),
        title: 'Profile page',
        test : req.ip
    });
});

module.exports = router;

