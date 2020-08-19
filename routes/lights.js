const express = require('express');
const secrets = require('../config/secrets')
const rest_helper = require('../helpers/rest_helper')
const router = express.Router();

router.get('/', function(req, res) {
    res.render('lights', {
        test : req.ip
    });
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