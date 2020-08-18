const PORT = 8601;
const environment = "dev";
envOptions = {
  dev: {
    sslPath: "/etc/pki/vizzyy/",
    sslOptions: {
      ca: null,
      key: 'server-key.pem',
      cert: 'server-cert.pem',
      requestCert: false,
      rejectUnauthorized: false
    }
  },
  prod: {
    sslPath: "/some/prod/path/",
    sslOptions: {
      ca: 'ca-cert.pem',
      key: 'server-key.pem',
      cert: 'server-cert.pem',
      requestCert: true,
      rejectUnauthorized: true
    }
  }
};

module.exports = {
  PORT: PORT,
  envOptions: envOptions,
  environment: environment
};