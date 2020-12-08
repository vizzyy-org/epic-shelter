const express = require('express');
const router = express.Router();
const config = require("../config/environments")

router.get('/', function(req, res) {
    res.render('users', {
        userProfile: req.user,
        userProfileParsed: JSON.stringify(req.user, null, 2),
        title: 'Profile page',
        ipaddress : req.ip.toString().replace('::ffff:', ''),
        instanceId: config.instance_id
    });
});

module.exports = router;

