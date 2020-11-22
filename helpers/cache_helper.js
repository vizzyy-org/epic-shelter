const cache = require("memory-cache");
let memCache = new cache.Cache();
const secrets = require('/etc/pki/vizzyy/secrets');
const env = require("../config/environments");
let isDev = secrets.environment === "dev"

module.exports = function (duration) {
    return (req, res, next) => {
        if (req.method !== "GET") { // do not cache POST/PUT/DELETE/etc
            if (isDev) console.log("Skipping cache for request method: " + req.method);
            next();
            return
        }

        let key = req.originalUrl || req.url;
        if (isDev) console.log("checking cache for: " + key);
        let cacheContent = memCache.get(key);
        if (cacheContent && !env.cache_excluded_paths.some(v => key.includes(v)) && key !== '/motion') {
            if (isDev) console.log("Cache hit!");
            res.send(cacheContent);
        } else {
            if (isDev) console.log("Cache miss!");
            res.sendResponse = res.send;
            res.send = (body) => {
                memCache.put(key, body, duration * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
}