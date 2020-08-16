const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('lights', {
        test : req.ip
    });
});

module.exports = router;