const express = require('express');
const {MjpegProxy} = require("../helpers/mjpeg-proxy");
const secrets = require('../config/secrets')
const router = express.Router();

router.get('/', function(req, res){
   res.render('streams');
});

router.get('/door', function(req, res, next) {
    next();
}, new MjpegProxy('https://'+secrets.HUB_HOST+'/video').proxyRequest);

module.exports = router;