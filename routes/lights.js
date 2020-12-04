const express = require('express');
const rest_helper = require('../helpers/rest_helper')
const router = express.Router();
const env = require('../config/environments')

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
router.post('/strip/inside', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + env.secrets.HUB_HOST + '/inside/arrange/' + req.body.status,
        'GET',
        {}, req, res);
});

// toggle inside lights strip rgb
router.post('/strip/inside/custom', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + env.secrets.HUB_HOST + '/inside/custom/?colorValue=%23' + req.body.colorValue.split("#")[1],
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

router.post('/strip/outside/custom', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + env.secrets.HUB_HOST + '/outside/custom/?colorValue=%23' + req.body.colorValue.split("#")[1],
        'GET',
        {}, req, res);
});

router.post('/strip/outside', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + env.secrets.HUB_HOST + '/outside/arrange/' + req.body.status,
        'GET',
        {}, req, res);
});


// Bedroom lights

router.post('/bedroom/xmas', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + env.secrets.HUB_HOST + '/lights/light2?status=' + req.body.status,
        'GET',
        {}, req, res);
});

router.post('/bedroom/lamp', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + env.secrets.HUB_HOST + '/lights/light1?status=' + req.body.status,
        'GET',
        {}, req, res);
});

router.get('/bedroom/status', function(req, res) {
    rest_helper.mutual_auth_call(
        "https://" + env.secrets.HUB_HOST + '/lights/status',
        'GET',
        {}, req, res);
});


module.exports = router;