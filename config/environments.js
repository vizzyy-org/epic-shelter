const fs = require("fs");
const log_page_size = 15;
const secrets = require('/etc/pki/vizzyy/secrets');
const PORT = secrets.PORT ? secrets.PORT : 443;
const cache_excluded_paths = /\/logs|\/streams$|\/motion$/g;
const logging_excluded_paths = /\/logs\?page_num/
const db_config = {
    host: secrets.HUB_HOST,
    port: secrets.database.DB_PORT,
    user: secrets.database.DB_USER,
    password: secrets.database.DB_PASS,
    database: secrets.database.DB_USER,
    ssl: {
        ca: fs.readFileSync('/etc/pki/vizzyy/dbpub.crt')
    }
};

envOptions = {
    dev: {
        sslPath: "/etc/pki/vizzyy/",
        sslOptions: {
            ca: "server-ca.pem",
            key: 'server-key.pem',
            cert: 'server-cert.pem',
            requestCert: false,
            rejectUnauthorized: false
        },
        rest_ssl_key: 'rest_private_key.pem',
        rest_ssl_cert: 'rest_public_cert.pem',
        stream_limit_minutes: 60,
        throttle_limit: 60,
        cache_ttl_seconds: 360000
    },
    prod: {
        sslPath: "/etc/pki/vizzyy/",
        sslOptions: {
            ca: "server-ca.pem",
            key: 'server-key.pem',
            cert: 'server-cert.pem',
            requestCert: true,
            rejectUnauthorized: true
        },
        rest_ssl_key: 'rest_private_key.pem',
        rest_ssl_cert: 'rest_public_cert.pem',
        stream_limit_minutes: 1,
        throttle_limit: 300,
        cache_ttl_seconds: 36000
    },
    test: {
        sslPath: "/etc/pki/vizzyy/",
        sslOptions: {
            ca: "server-ca.pem",
            key: 'server-key.pem',
            cert: 'server-cert.pem',
            requestCert: false,
            rejectUnauthorized: false
        },
        rest_ssl_key: 'rest_private_key.pem',
        rest_ssl_cert: 'rest_public_cert.pem',
        stream_limit_minutes: 0,
        throttle_limit: 1000,
        cache_ttl_seconds: 30
    }
};

module.exports = {
    PORT: PORT,
    envOptions: envOptions,
    log_page_size: log_page_size,
    db_config: db_config,
    secrets: secrets,
    cache_excluded_paths: cache_excluded_paths,
    logging_excluded_paths: logging_excluded_paths
};