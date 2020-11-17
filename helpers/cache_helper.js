const cache = require("memory-cache");
let memCache = new cache.Cache();
const secrets = require('/etc/pki/vizzyy/secrets');

module.exports = function (duration) {
    return (req, res, next) => {
        let key =  '__express__' + req.originalUrl || req.url
        if(secrets.environment === "dev")
            console.log("checking cache for: " + key)
        let cacheContent = memCache.get(key);
        if(cacheContent){
            if(secrets.environment === "dev")
                console.log("Cache hit!")
            res.send( cacheContent );
        }else{
            if(secrets.environment === "dev")
                console.log("Cache miss!")
            res.sendResponse = res.send
            res.send = (body) => {
                memCache.put(key,body,duration*1000);
                res.sendResponse(body)
            }
            next()
        }
    }
}