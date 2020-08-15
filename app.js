const express = require('express');
const config = require('./config/config')
const app = express();
const server = require('https').Server(config.sslOptions, app);
const io = require('socket.io')(server);
const home = require('./routes/home')

app.set('io', io);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Routers
app.use('/favicon.ico', express.static('./public/favicon.ico'));
app.use('/', home);

io.on('connection', socket => {
    console.log("New connection.");
});

server.listen(config.PORT);
server.on('listening', function() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
});

module.exports = {
    app: app
};