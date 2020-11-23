const express = require('express');
const logging = require("../helpers/db_helper");
const router = express.Router();

router.get('/', function(req, res) {
    res.render('users', {
        userProfile: req.user,
        userProfileParsed: JSON.stringify(req.user, null, 2),
        title: 'Profile page',
        ipaddress : req.ip
    });
});

module.exports = router;

