const express = require('express');
const secrets = require('../config/secrets')
const rest_helper = require('../helpers/rest_helper')
const router = express.Router();

router.get('/', function(req, res) {
    res.render('door', {
        test : req.ip
    });
});

router.get('/open', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/door/open?entry=OPENED: OVERRIDE BY UI',
        'GET',
        {}, req, res);
});

router.get('/close', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/door/close?entry=OPENED: OVERRIDE BY UI',
        'GET',
        {}, req, res);
});

router.get('/status', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/door/status',
        'GET',
        {}, req, res);
});

module.exports = router;