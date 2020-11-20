const secrets = require('/etc/pki/vizzyy/secrets');
const logging = require("./logging_helper");

module.exports = function () {
    return function (req, res, next) {
        let username = `${secrets.environment}-USER`;
        if(secrets.environment === "prod") {
            username = req.connection.getPeerCertificate().subject.CN;
        }
        req.user = {displayName: username};
        logging.append_to_log(req.originalUrl || req.url, username);
        next();
    };
};