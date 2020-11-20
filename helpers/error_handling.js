const config = require('../config/environments')
const logging_helper = require("./logging_helper");

module.exports = {
    queryErrors: function () { return function authFailure(req, res, next) {
        if (req && req.query && req.query.error) {
            // req.flash('error', req.query.error);
        }
        if (req && req.query && req.query.error_description) {
            // req.flash('error_description', req.query.error_description);
        }
        return next();
    }},
    pageNotFound: function () { return function pageNotFound(req, res, next) {
        const err = new Error('404 -- Page Not Found.');
        err.status = 404;
        return next(err);
    }},
    errorHandler: function () { return function errorHandler(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err);
        logging_helper.append_to_log(err, null);
        res.render('error', {
            locals: {
                message: {
                    error: req.query && req.query.error ? req.query.error : "Generic Error",
                    error_description: req.query && req.query.error_description ? req.query.error_description : "Generic Error Description"
                }
            },
            message: err.message,
            error: config.secrets.environment === 'dev' ? err : {}
        });
    }}
};