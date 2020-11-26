const config = require('../config/environments');
const logging = require('./db_helper');
const rp = require('request-promise');

module.exports = {
    mutual_auth_call: function (URL, method, payload, req, res) {

        let requestOptions = Object.assign({}, config.ssl_base_config);
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