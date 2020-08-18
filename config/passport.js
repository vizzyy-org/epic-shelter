const Auth0Strategy = require('passport-auth0');
const passport = require('passport');
const secrets = require('./secrets')

const strategy = new Auth0Strategy(
    {
        domain: secrets.AUTH0_DOMAIN,
        clientID: secrets.AUTH0_CLIENT_ID,
        clientSecret: secrets.AUTH0_CLIENT_SECRET,
        callbackURL: secrets.AUTH0_CALLBACK_URL
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
        return done(null, profile);
    }
);

passport.use(strategy);

// You can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

module.exports = passport;