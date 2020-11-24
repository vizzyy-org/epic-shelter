const config = require('../config/environments');
const logging = require('./db_helper');
const rp = require('request-promise');
const awsParamStore = require("aws-param-store");

const ssl_base_config = {
    uri: '',
    json: true,
    port: 443,
    method: 'GET',
    key: Buffer.from(awsParamStore.getParameterSync( '/epic-shelter-rest-key', config.region).Value, 'utf8'),
    cert: Buffer.from(awsParamStore.getParameterSync( '/epic-shelter-rest-cert', config.region).Value, 'utf8'),
    rejectUnauthorized: true
}

module.exports = {
    ssl_base_config: ssl_base_config,
    mutual_auth_call: function (URL, method, payload, req, res) {

        let requestOptions = Object.assign({}, ssl_base_config);
        requestOptions.uri = URL;
        requestOptions.method = method;
        rp(requestOptions).then(function(body) {
            res.send(body);
        }).catch(err => {
            logging.append_to_log(err).then();
            res.redirect('/error');
        });

    },
};