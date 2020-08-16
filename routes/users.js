const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('users', {
        test : req.ip
    });
});

/* GET user profile. */
router.get('/user', function (req, res, next) {
    const { _raw, _json, ...userProfile } = req.user;
    res.render('user', {
        userProfile: JSON.stringify(userProfile, null, 2),
        title: 'Profile page'
    });
});

module.exports = router;

