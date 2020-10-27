module.exports = function () {
    return function (req, res, next) {
        let incoming = req.connection.getPeerCertificate().subject.CN;
        console.log("Incoming request...");
        console.log("   CN: " + incoming);
        console.log("   DEST: " + req.originalUrl);

        // req.isAdmin = constants.admins.includes(incoming);
        // req.isOwner = constants.owner.includes(incoming);
        // req.commonName = incoming;
        next();
    };
};