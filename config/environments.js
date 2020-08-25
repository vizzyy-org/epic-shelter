const mysql = require("mysql");
const smysql = require('sync-mysql');
const fs = require("fs");
const PORT = 443;
const log_page_size = 15;
const secrets = require('/etc/pki/vizzyy/secrets');
const db_config = {
  host     : secrets.HUB_HOST,
  port     : secrets.database.DB_PORT,
  user     : secrets.database.DB_USER,
  password : secrets.database.DB_PASS,
  database : secrets.database.DB_USER,
  ssl      : {
    ca   : fs.readFileSync('/etc/pki/vizzyy/dbpub.crt')
  }
};

const connection = mysql.createConnection(db_config);
const sconnection = new smysql(db_config);

envOptions = {
  dev: {
    sslPath: "/etc/pki/vizzyy/",
    sslOptions: {
      ca: null,
      key: 'server-key.pem',
      cert: 'server-cert.pem',
      requestCert: false,
      rejectUnauthorized: false
    },
    rest_ssl_key: 'rest_private_key.pem',
    rest_ssl_cert: 'rest_public_cert.pem'
  },
  prod: {
    sslPath: "/etc/pki/vizzyy/",
    sslOptions: {
      ca: null,
      key: 'server-key.pem',
      cert: 'server-cert.pem',
      requestCert: false,
      rejectUnauthorized: false
    },
    rest_ssl_key: 'rest_private_key.pem',
    rest_ssl_cert: 'rest_public_cert.pem'
  }
};

module.exports = {
  PORT: PORT,
  envOptions: envOptions,
  environment: environment,
  log_page_size: log_page_size,
  db: connection,
  sdb: sconnection,
  db_config: db_config
};