// lib/middleware/secured.js

module.exports = function () {
    return function secured (req, res, next) {
        // console.log("Checking secured...")
        if (req.user) { return next(); }
        req.session.returnTo = req.originalUrl;
        res.redirect('/login');
    };
};