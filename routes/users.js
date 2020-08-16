const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('users', {
        test : req.ip
    });
});

module.exports = router;