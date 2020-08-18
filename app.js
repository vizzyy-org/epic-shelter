const express = require('express');
const fs = require('fs');
const path = require('path');
const passport = require('./config/passport');
const userInViews = require('./helpers/userInViews');
const secured = require('./helpers/secured');
const session = require('express-session');
const config = require('./config/environments')
const secrets = require('./config/secrets')
const home = require('./routes/home')
const logs = require('./routes/logs')
const door = require('./routes/door')
const users = require('./routes/users')
const streams = require('./routes/streams')
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
    rejectUnauthorized: env.sslOptions.rejectUnauthorized
}, app);
const io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
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
app.use('/users', users);
app.use('/door', door);
app.use('/logs', logs);
app.use('/', home);
app.use(errors.authFailure());
app.use(errors.pageNotFound());
app.use(errors.errorHandler());

io.on('connection', function (socket) {
    socket.on('page_load', function (data) {
        console.log(data+ " page loaded.");
    });
});

server.listen(config.PORT);
server.on('listening', function() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
});

module.exports = app;