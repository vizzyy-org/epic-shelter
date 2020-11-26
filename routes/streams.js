const express = require('express');
const router = express.Router();
const request = require("request");
const env = require('../config/environments')

router.get('/', function (req, res) {
    res.render('streams');
});

router.get('/door', (req, res) => {
    let reqUrl = 'https://' + env.secrets.HUB_HOST + '/video';
    handleStream(req, res, reqUrl);
})

router.get('/battery', (req, res) => {
    let reqUrl = 'https://' + env.secrets.HUB_HOST + '/video2';
    handleStream(req, res, reqUrl);
})

function handleStream(req, res, reqUrl){
    let requestOptions = Object.assign({}, env.ssl_base_config);
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
    let timeout = 60000 * parseInt(env.envOptions[env.secrets.environment].stream_limit_minutes);
    setTimeout(() => { stream.abort() }, timeout);
}


module.exports = router;