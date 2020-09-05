const config = require('../config/environments')


module.exports = function () {
    return function secured (req, res, next) {
        if (req.user || ["dev", "test"].includes(config.secrets.environment)) { return next(); }
        req.session.returnTo = req.originalUrl;
        res.redirect('/login');
    };
};