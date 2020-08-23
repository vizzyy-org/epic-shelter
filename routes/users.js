const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('users', {
        userProfile: req.user,
        userProfileParsed: JSON.stringify(req.user, null, 2),
        title: 'Profile page',
        test : req.ip
    });
});

module.exports = router;

