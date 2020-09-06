const express = require('express');
const secrets = require('/etc/pki/vizzyy/secrets');
const rest_helper = require('../helpers/rest_helper')
const logging = require("../helpers/logging_helper");
const router = express.Router();

router.get('/', function(req, res) {
    logging.append_to_log("opened lights main page.", req.user ? req.user.displayName : "DEV USER");
    res.render('lights', {
        test : req.ip
    });
});

router.get('/inside', function(req, res) {
    logging.append_to_log("opened lights inside page.", req.user ? req.user.displayName : "DEV USER");
    res.render('lights_strip_inside', {
        test : req.ip
    });
});

router.get('/outside', function(req, res) {
    logging.append_to_log("opened lights outside page.", req.user ? req.user.displayName : "DEV USER");
    res.render('lights_strip_outside', {
        test : req.ip
    });
});

router.get('/strip/inside', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/inside/arrange/' + req.query.status,
        'GET',
        {}, req, res);
});

router.get('/strip/outside', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/outside/arrange/' + req.query.status,
        'GET',
        {}, req, res);
});

router.get('/bedroom/xmas', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/lights/light2?status=' + req.query.status,
        'GET',
        {}, req, res);
});

router.get('/bedroom/lamp', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/lights/light1?status=' + req.query.status,
        'GET',
        {}, req, res);
});



module.exports = router;