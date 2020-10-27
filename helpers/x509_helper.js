const logging = require("./logging_helper");
module.exports = function () {
    return function (req, res, next) {
        let incoming = req.connection.getPeerCertificate().subject.CN;
        logging.append_to_log("Incoming request - CN: " + incoming + " - DEST: " + req.originalUrl);

        // req.isAdmin = constants.admins.includes(incoming);
        // req.isOwner = constants.owner.includes(incoming);
        req.user = { displayName: incoming };
        next();
    };
};