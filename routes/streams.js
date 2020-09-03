const express = require('express');
const logging = require('../helpers/logging_helper');
const {MjpegProxy} = require("../helpers/mjpeg_proxy");
const secrets = require('/etc/pki/vizzyy/secrets');
const router = express.Router();

router.get('/', function(req, res){
   res.render('streams');
});

router.get('/door', function(req, res, next) {
    logging.append_to_log(req.user ? req.user.displayName : "DEV USER" + " opened vox stream.");
    next();
}, new MjpegProxy('https://'+secrets.HUB_HOST+'/video').proxyRequest);

module.exports = router;