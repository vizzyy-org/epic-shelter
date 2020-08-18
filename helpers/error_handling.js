const config = require('../config/environments')

module.exports = {
    authFailure: function () { return function authFailure(req, res, next) {
        if (req && req.query && req.query.error) {
            req.flash('error', req.query.error);
        }
        if (req && req.query && req.query.error_description) {
            req.flash('error_description', req.query.error_description);
        }
        return next();
    }},
    pageNotFound: function () { return function pageNotFound(req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        return next(err);
    }},
    errorHandler: function () { return function errorHandler(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: config.environment === 'dev' ? err : {}
        });
    }}
};