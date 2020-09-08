const logging = require('../helpers/logging_helper');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const util = require('util');
const url = require('url');
const querystring = require('querystring');

// Perform the login, after login Auth0 will redirect to callback
router.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile'
}), function (req, res) {
    console.log("/login endpoint");
    res.redirect('/');
});

// Perform the final stage of authentication and redirect to previously requested URL or '/user'
router.get('/callback', function (req, res, next) {
    console.log("/callback endpoint 1");
    passport.authenticate('auth0', function (err, user, info) {
        console.log("/callback endpoint 2");
        if (err) {
            console.log("/callback endpoint error");
            console.log(err);
            return next(err);
        }
        if (!user) {
            console.log("no user present from JWT");
            console.log(info);
            console.log("user: " + user);
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {
            console.log("req.logIn");
            if (err) {
                console.log("req.logIn error");
                console.log(err);
                return next(err);
            }
            const returnTo = req.session.returnTo;
            console.log("returnTo: "+ returnTo);
            delete req.session.returnTo;
            logging.append_to_log( "logged in.", req.user.displayName);
            res.redirect(returnTo || '/users');
        });
    })(req, res, next);
});

// router.get('/logout', (req, res) => {
//     req.logout();
//
//     let returnTo = req.protocol + '://' + req.hostname;
//     let port = req.connection.localPort;
//     if (port !== undefined && port !== 80 && port !== 443) {
//         returnTo += ':' + port;
//     }
//     let logoutURL = new url.URL(
//         util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
//     );
//     let searchString = querystring.stringify({
//         client_id: process.env.AUTH0_CLIENT_ID,
//         returnTo: returnTo
//     });
//     logoutURL.search = searchString;
//
//     res.redirect(logoutURL);
// });

module.exports = router;