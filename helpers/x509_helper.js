const secrets = require('/etc/pki/vizzyy/secrets');

module.exports = function () {
    return function (req, res, next) {
        if(secrets.environment === "prod") {
            console.log(secrets.environment)
            let incoming = req.connection.getPeerCertificate().subject.CN;
            req.user = {displayName: incoming};
            console.log(req.user);
        }
        next();
    };
};