const cache = require("memory-cache");
let memCache = new cache.Cache();
const env = require("../config/environments");
let isDev = env.secrets.environment === "dev"

module.exports = function (duration) {
    return (req, res, next) => {
        let key = req.originalUrl || req.url;

        // do not cache POST/PUT/DELETE/etc, or any excluded path
        if (req.method !== "GET" || key.match(env.cache_excluded_paths)) {
            if (isDev) console.log(`Skipping cache for [request: ${key}, method: ${req.method}]`);
            next();
            return
        }

        if (isDev) console.log("checking cache for: " + key);
        let cacheContent = memCache.get(key);
        if (cacheContent) {
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