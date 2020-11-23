const secrets = require('/etc/pki/vizzyy/secrets');
const logging = require("./db_helper");
const env = require("../config/environments");

module.exports = function () {
    return function (req, res, next) {
        let clientCert = req.connection.getPeerCertificate();
        let hasClientCert = Object.keys(clientCert).length; // return 0 if undefined peer cert
        let path = req.originalUrl || req.url;
        req.user = {
            displayName: hasClientCert ? clientCert.subject.CN : `${secrets.environment}-USER`,
            validFrom: hasClientCert ? clientCert.valid_from : new Date().toDateString(),
            validTo: hasClientCert ? clientCert.valid_to : new Date().toDateString(),
            fingerprint: hasClientCert ? clientCert.fingerprint : `${secrets.environment}-FINGERPRINT`
        };
        if (!path.match(env.logging_excluded_paths))
            logging.append_to_log(path, req.user.displayName);
        next();
    };
};