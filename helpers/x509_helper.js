const secrets = require('/etc/pki/vizzyy/secrets');
const logging = require("./logging_helper");
const env = require("../config/environments");

module.exports = function () {
    return function (req, res, next) {
        let username = `${secrets.environment}-USER`;
        let path = req.originalUrl || req.url;
        if(secrets.environment === "prod") {
            username = req.connection.getPeerCertificate().subject.CN;
        }
        req.user = {displayName: username};
        if (!env.logging_excluded_paths.some(v => path.includes(v)))
            logging.append_to_log(path, username);
        next();
    };
};