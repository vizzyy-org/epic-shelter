const express = require('express');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const passport = require('./config/passport');
const userInViews = require('./helpers/userInViews');
const secured = require('./helpers/secured');
const session = require('express-session');
const config = require('./config/environments')
const secrets = require('/etc/pki/vizzyy/secrets');
const logging = require('./helpers/logging_helper');
const home = require('./routes/home')
const logs = require('./routes/logs')
const door = require('./routes/door')
const users = require('./routes/users')
const streams = require('./routes/streams')
const motion = require('./routes/motion')
const lights = require('./routes/lights')
const auth = require('./routes/auth');
const errors = require('./helpers/error_handling')
const env = config.envOptions[config.environment];
const app = express();
const server = require('https').Server({
    ca: env.sslOptions.ca ? fs.readFileSync(env.sslPath + env.sslOptions.ca) : [],
    key: fs.readFileSync(env.sslPath + env.sslOptions.key),
    cert: fs.readFileSync(env.sslPath + env.sslOptions.cert),
    requestCert: env.sslOptions.requestCert,
    rejectUnauthorized: env.sslOptions.rejectUnauthorized,
    ciphers: [
        "ECDHE-RSA-AES256-SHA384",
        "DHE-RSA-AES256-SHA384",
        "ECDHE-RSA-AES256-SHA256",
        "DHE-RSA-AES256-SHA256",
        "ECDHE-RSA-AES128-SHA256",
        "DHE-RSA-AES128-SHA256",
        "HIGH",
        "!aNULL",
        "!eNULL",
        "!EXPORT",
        "!DES",
        "!RC4",
        "!MD5",
        "!PSK",
        "!SRP",
        "!CAMELLIA"
    ].join(':'),
    honorCipherOrder: true
}, app);
const io = require('socket.io')(server);

app.set('io', io);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet.hsts({
    maxAge: 31536000000, //one year
    includeSubDomains: true,
    force: true
}));
app.use(session({
    secret: secrets.sessionSecret,
    cookie: {secure: true},
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', auth);
app.use('/favicon.ico', express.static('./public/favicon.ico'));
app.use(secured()); // everything after this is secured
app.use(userInViews());
app.use('/lights', lights);
app.use('/streams', streams);
app.use('/motion', motion);
app.use('/users', users);
app.use('/door', door);
app.use('/logs', logs);
app.use('/', home);
app.use(errors.authFailure());
app.use(errors.pageNotFound());
app.use(errors.errorHandler());

io.on('connection', function (socket) {
    socket.on('page_load', function (data) {
        // logging.append_to_log(req.user.displayName + " loaded page " +data);
    });
});

server.listen(config.PORT);
server.on('listening', function() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    logging.append_to_log('Listening on ' + bind);
});

module.exports = app;