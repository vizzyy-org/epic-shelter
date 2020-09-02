const fs = require('fs');
const config = require('../config/environments');
const logging = require('./logging_helper');
const env = config.envOptions[config.environment];
const rp = require('request-promise');

const ssl_base_config = {
    uri: '',
    json: true,
    port: 443,
    method: 'GET',
    key: fs.readFileSync(env.sslPath + env.rest_ssl_key),
    cert: fs.readFileSync(env.sslPath + env.rest_ssl_cert),
    rejectUnauthorized: true
}

module.exports = {
    ssl_base_config: ssl_base_config,
    mutual_auth_call: function (URL, method, payload, req, res) {
        // logging.append_to_log("REST call endpoint: "+req.url);

        let socket = req.app.get('io');
        let requestOptions = Object.assign({}, ssl_base_config);
        requestOptions.uri = URL;
        requestOptions.method = method;
        rp(requestOptions).then(function(body) {
            let user = req.user ? req.user.displayName : "DEV-USER";
            logging.append_to_log(user + " successfully called: "+URL);
            socket.emit('state', req.url);
            // console.log(body);
            res.send(body);
        }).catch(err => {
            logging.append_to_log(err);
            res.redirect('/error');
        });

    },
};