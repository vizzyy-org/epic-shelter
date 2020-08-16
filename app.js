const express = require('express');
const config = require('./config/config')
const app = express();
const fs = require('fs');
const path = require('path');
const env = config.envOptions[config.environment];
const server = require('https').Server({
    ca: env.sslOptions.ca ? fs.readFileSync(env.sslPath + env.sslOptions.ca) : [],
    key: fs.readFileSync(env.sslPath + env.sslOptions.key),
    cert: fs.readFileSync(env.sslPath + env.sslOptions.cert),
    requestCert: env.sslOptions.requestCert,
    rejectUnauthorized: env.sslOptions.rejectUnauthorized
}, app);
const io = require('socket.io')(server);
const home = require('./routes/home')

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

// Routers
app.use('/favicon.ico', express.static('./public/favicon.ico'));
app.use('/', home);

io.on('connect', socket => {
    console.log("New connection.");
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