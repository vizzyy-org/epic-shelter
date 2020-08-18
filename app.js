const express = require('express');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const Auth0Strategy = require('passport-auth0');
const userInViews = require('./helpers/userInViews');
const secured = require('./helpers/secured');
const session = require('express-session');
const config = require('./config/config')
const secrets = require('./config/secrets')
const home = require('./routes/home')
const logs = require('./routes/logs')
const door = require('./routes/door')
const users = require('./routes/users')
const streams = require('./routes/streams')
const lights = require('./routes/lights')
const auth = require('./routes/auth');

// Configure Passport to use Auth0
const strategy = new Auth0Strategy(
    {
        domain: secrets.AUTH0_DOMAIN,
        clientID: secrets.AUTH0_CLIENT_ID,
        clientSecret: secrets.AUTH0_CLIENT_SECRET,
        callbackURL: secrets.AUTH0_CALLBACK_URL
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
        // accessToken is the token to call Auth0 API (not needed in the most cases)
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
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

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

const env = config.envOptions[config.environment];
const server = require('https').Server({
    ca: env.sslOptions.ca ? fs.readFileSync(env.sslPath + env.sslOptions.ca) : [],
    key: fs.readFileSync(env.sslPath + env.sslOptions.key),
    cert: fs.readFileSync(env.sslPath + env.sslOptions.cert),
    requestCert: env.sslOptions.requestCert,
    rejectUnauthorized: env.sslOptions.rejectUnauthorized
}, app);
const io = require('socket.io')(server);

app.use(session({
    secret: secrets.sessionSecret,
    cookie: {secure: true},
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Routers
app.use('/', auth);
app.use('/favicon.ico', express.static('./public/favicon.ico'));
app.use(secured()); // everything after this is secured
app.use(userInViews());
app.use('/lights', lights);
app.use('/streams', streams);
app.use('/users', users);
app.use('/door', door);
app.use('/logs', logs);
app.use('/', home);

io.on('connection', function (socket) {
    socket.on('page_load', function (data) {
        console.log(data+ " page loaded.");
    });
});

// Handle auth failure error messages
app.use(function (req, res, next) {
    if (req && req.query && req.query.error) {
        req.flash('error', req.query.error);
    }
    if (req && req.query && req.query.error_description) {
        req.flash('error_description', req.query.error_description);
    }
    next();
});

app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (config.environment === 'dev') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production error handler
// No stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(config.PORT);
server.on('listening', function() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
});

module.exports = {
    app: app,
    env: env
};