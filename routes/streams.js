const express = require('express');
const logging = require('../helpers/logging_helper');
const secrets = require('/etc/pki/vizzyy/secrets');
const rest_helper = require('../helpers/rest_helper')
const router = express.Router();
const request = require("request");
const env = require('../config/environments')

router.get('/', function (req, res) {
    res.render('streams');
});

router.get('/door', (req, res) => {
    logging.append_to_log("opened vox stream.", req.user ? req.user.displayName : "DEV USER");
    let reqUrl = 'https://' + secrets.HUB_HOST + '/video';
    let requestOptions = Object.assign({}, rest_helper.ssl_base_config);
    requestOptions.uri = reqUrl;
    requestOptions.json = false;

    // Request-Promise docs recommend using Request for piping streams
    // to avoid large memory usage
    let stream = request(requestOptions);
    stream.on('error', console.log);
    stream.pipe(res);
    // When page is closed/changed
    req.on('close', () => {
        stream.abort();
    });

    //Limit resources used -- 60000ms = 1 minute
    let timeout = 60000 * parseInt(env.envOptions[secrets.environment].stream_limit_minutes);
    console.log(timeout);
    setTimeout(() => { stream.abort() }, timeout);
})

router.get('/battery', (req, res) => {
    logging.append_to_log("opened battery stream.", req.user ? req.user.displayName : "DEV USER");
    let reqUrl = 'https://' + secrets.HUB_HOST + '/video2';
    let requestOptions = Object.assign({}, rest_helper.ssl_base_config);
    requestOptions.uri = reqUrl;
    requestOptions.json = false;

    // Request-Promise docs recommend using Request for piping streams
    // to avoid large memory usage
    let stream = request(requestOptions);
    stream.on('error', console.log);
    stream.pipe(res);
    // When page is closed/changed
    req.on('close', () => {
        stream.abort();
    });

    //Limit resources used -- 60000ms = 1 minute
    let timeout = 60000 * parseInt(env.envOptions[secrets.environment].stream_limit_minutes);
    console.log(timeout);
    setTimeout(() => { stream.abort() }, timeout);
})


module.exports = router;