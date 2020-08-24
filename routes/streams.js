const express = require('express');
const logging = require('../helpers/logging_helper');
const {MjpegProxy} = require("../helpers/mjpeg-proxy");
const secrets = require('/etc/pki/vizzyy/secrets');
const router = express.Router();

router.get('/', function(req, res){
   res.render('streams');
});

router.get('/door', function(req, res, next) {
    logging.append_to_log(req.user.displayName + " opened vox stream.");
    next();
}, new MjpegProxy('https://'+secrets.HUB_HOST+'/video').proxyRequest);

router.get('/motion', function(req, res){
    logging.append_to_log(req.user.displayName + " opened motion page.");
    res.render('motion');
});

module.exports = router;