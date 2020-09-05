const express = require('express');
const logging = require('../helpers/logging_helper');
const secrets = require('/etc/pki/vizzyy/secrets');
const rest_helper = require('../helpers/rest_helper')
const router = express.Router();
const request = require("request-promise");

router.get('/', function (req, res) {
    res.render('streams');
});

router.get('/door', (req, res) => {
    logging.append_to_log(req.user ? req.user.displayName : "DEV USER" + " opened vox stream.");
    let reqUrl = 'https://' + secrets.HUB_HOST + '/video';
    let requestOptions = Object.assign({}, rest_helper.ssl_base_config);
    requestOptions.uri = reqUrl;
    requestOptions.json = false;

    let pipe = request(requestOptions).pipe(res);

    pipe.on('error', function () {
        console.log('error handling is needed because pipe will break once pipe.end() is called')
    });
    //client quit normally
    req.on('end', function () {
        console.log("end - Pipe end");
        pipe.end();
    });
    //client quit unexpectedly
    req.on('close', function () {
        console.log("close - Pipe end");
        pipe.end();
    });
})


module.exports = router;