const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('logs', {
        test : req.ip
    });
});

module.exports = router;