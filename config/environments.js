const awsParamStore = require( 'aws-param-store' );
const { constants } = require('crypto')
const region = { region: 'us-east-1' };
const log_page_size = 15;
const ssm_params = new Map(awsParamStore.getParametersByPathSync(
    '/epic-shelter', region).map(i => [i.Name, i.Value]));
const secrets = JSON.parse(ssm_params.get('/epic-shelter/secrets').toString());
secrets.environment = process.env.NODE_ENV;
const PORT = secrets.environment === "test" ? 9443 : 443;
const cache_excluded_paths = /\/logs|\/users|\/streams$|\/motion$/g;
const logging_excluded_paths = /\/logs\?page_num/

const db_config = {
    host: secrets.HUB_HOST,
    port: secrets.database.DB_PORT,
    user: secrets.database.DB_USER,
    password: secrets.database.DB_PASS,
    database: secrets.database.DB_USER,
    connectTimeout: 60000,
    connectionLimit: 10,
    ssl: {
        ca: Buffer.from(ssm_params.get( '/epic-shelter/db-cert').toString(), 'utf8')
    }
};

const envOptions = {
    dev: {
        sslOptions: {
            requestCert: false,
            rejectUnauthorized: false
        },
        stream_limit_minutes: 60,
        throttle_limit: 60,
        cache_ttl_seconds: 360000
    },
    production: {
        sslOptions: {
            requestCert: true,
            rejectUnauthorized: true
        },
        stream_limit_minutes: 1,
        throttle_limit: 300,
        cache_ttl_seconds: 36000
    },
    test: {
        sslOptions: {
            requestCert: false,
            rejectUnauthorized: false
        },
        stream_limit_minutes: 0,
        throttle_limit: 1000,
        cache_ttl_seconds: 30
    }
};

const serverConfig = {
    ca: Buffer.from(ssm_params.get('/epic-shelter/server-ca').toString(), 'utf8'),
    key: Buffer.from(ssm_params.get('/epic-shelter/server-key').toString(), 'utf8'),
    cert: Buffer.from(ssm_params.get('/epic-shelter/server-cert').toString(), 'utf8'),
    requestCert: envOptions[secrets.environment].sslOptions.requestCert,
    rejectUnauthorized: envOptions[secrets.environment].sslOptions.rejectUnauthorized,
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
}

const hstsConfig = {
    maxAge: 31536000000, //one year
    includeSubDomains: true,
    force: true
}

const ssl_base_config = {
    uri: '',
    json: true,
    port: 443,
    method: 'GET',
    key: Buffer.from(ssm_params.get('/epic-shelter/rest-key').toString(), 'utf8'),
    cert: Buffer.from(ssm_params.get('/epic-shelter/rest-cert').toString(), 'utf8'),
    rejectUnauthorized: true
}

module.exports = {
    PORT: PORT,
    envOptions: envOptions,
    log_page_size: log_page_size,
    db_config: db_config,
    secrets: secrets,
    cache_excluded_paths: cache_excluded_paths,
    logging_excluded_paths: logging_excluded_paths,
    region: region,
    serverConfig: serverConfig,
    hstsConfig: hstsConfig,
    ssl_base_config: ssl_base_config
};