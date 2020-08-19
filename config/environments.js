const PORT = 8601;
const environment = "dev";
const log_page_size = 15;

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
      ca: 'ca-cert.pem',
      key: 'server-key.pem',
      cert: 'server-cert.pem',
      requestCert: true,
      rejectUnauthorized: true
    },
    rest_ssl_key: '',
    rest_ssl_cert: '',
    rest_ssl_ca: ''
  }
};

module.exports = {
  PORT: PORT,
  envOptions: envOptions,
  environment: environment,
  log_page_size: log_page_size,
};