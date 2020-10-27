const { constants } = require('crypto')
const express = require('express');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const config = require('./config/environments');
const logging = require('./helpers/logging_helper');
const home = require('./routes/home')
const logs = require('./routes/logs')
const door = require('./routes/door')
const users = require('./routes/users')
const streams = require('./routes/streams')
const motion = require('./routes/motion')
const lights = require('./routes/lights')
const errors = require('./helpers/error_handling')
const env = config.envOptions[config.secrets.environment];
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
    honorCipherOrder: true,
    secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1
}, app);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet.hsts({
    maxAge: 31536000000, //one year
    includeSubDomains: true,
    force: true
}));

app.use(function (req, res, next) {
    let incoming = req.connection.getPeerCertificate().subject.CN;
    logging.append_to_log("Incoming request...");
    logging.append_to_log("   CN: " + incoming);
    logging.append_to_log("   DEST: " + req.originalUrl);

    // req.isAdmin = constants.admins.includes(incoming);
    // req.isOwner = constants.owner.includes(incoming);
    // req.commonName = incoming;
    next();
})

app.use('/favicon.ico', express.static('./public/favicon.ico'));
app.use('/lights', lights);
app.use('/streams', streams);
app.use('/motion', motion);
app.use('/users', users);
app.use('/door', door);
app.use('/logs', logs);
app.use('/', home);
app.use(errors.queryErrors());
app.use(errors.pageNotFound());
app.use(errors.errorHandler());

server.listen(config.PORT);
server.on('listening', function() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    logging.append_to_log('Listening on ' + bind);
});

module.exports = server;