const logging = require("./logging_helper");
const secrets = require('/etc/pki/vizzyy/secrets');

module.exports = function () {
    return function (req, res, next) {
        console.log('test!!!!!')
        if(secrets.environment === "prod") {
            console.log(secrets.environment)
            let incoming = req.connection.getPeerCertificate().subject.CN;
            logging.append_to_log("Incoming request - CN: " + incoming + " - DEST: " + req.originalUrl);

            // req.isAdmin = constants.admins.includes(incoming);
            // req.isOwner = constants.owner.includes(incoming);
            req.user = {displayName: incoming};
            console.log(req.user);
        }
        next();
    };
};