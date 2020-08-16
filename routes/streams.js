const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('streams', {
        test : req.ip
    });
});

module.exports = router;