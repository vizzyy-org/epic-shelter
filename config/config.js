const fs = require('fs');

const PORT = 8601;
const sslPath = "/etc/pki/vizzyy/";
const sslOptions = {
  ca: [],
  key: fs.readFileSync(sslPath + 'server-key.pem'),
  cert: fs.readFileSync(sslPath + 'server-cert.pem'),
  requestCert: false,
  rejectUnauthorized: false
}

module.exports = {
  PORT: PORT,
  sslOptions: sslOptions,
  sslPath: sslPath
};