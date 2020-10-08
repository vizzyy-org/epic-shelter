const express = require('express');
const secrets = require('/etc/pki/vizzyy/secrets');
const rest_helper = require('../helpers/rest_helper')
const router = express.Router();

// Render main lights page

router.get('/', function(req, res) {
    res.render('lights');
});


// Inside Light Strip

// render inside lights strip control page
router.get('/inside', function(req, res) {
    res.render('lights_strip_inside');
});

// render inside lights custom rgb select page
router.get('/inside/custom', function(req, res) {
    res.render('lights_strip_inside_custom');
});

// toggle inside lights strip arrangement
router.get('/strip/inside', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/inside/arrange/' + req.query.status,
        'GET',
        {}, req, res);
});

// toggle inside lights strip rgb
router.get('/strip/inside/custom', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/inside/custom/?colorValue=%23' + req.query.colorValue.split("#")[1],
        'GET',
        {}, req, res);
});


// Outside Light Strip

router.get('/outside', function(req, res) {
    res.render('lights_strip_outside');
});

router.get('/outside/custom', function(req, res) {
    res.render('lights_strip_outside_custom');
});

router.get('/outside/custom/color', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/outside/custom/?colorValue=%23' + req.query.colorValue.split("#")[1],
        'GET',
        {}, req, res);
});

router.get('/strip/outside', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + secrets.HUB_HOST + '/outside/arrange/' + req.query.status,
        'GET',
        {}, req, res);
});


// Bedroom lights

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