# ![Grafana Screenshot](public/favicon.ico) Epic-Shelter 


![Node.js CI](https://github.com/Vizzyy/epic-shelter/workflows/Node.js%20CI/badge.svg?branch=master)

![Docker CI](https://github.com/vizzyy-org/epic-shelter/workflows/Docker%20CI/badge.svg?branch=master) 

```javascript
const express = require('express');
const app = express();

server.listen(config.PORT);
server.on('listening', function() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    logging.append_to_log('Listening on ' + bind);
});

module.exports = app;
```