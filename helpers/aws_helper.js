const AWS = require('aws-sdk');
const env = require("../config/environments");
AWS.config.update(env.region);
const s3 = new AWS.S3();

module.exports = {
    s3_get_object: function (bucket, key){
        return new Promise(function(resolve, reject) {
            s3.getObject({ Bucket: bucket, Key: key }, function(err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(data.Body.toString('utf-8'));
                }
            });
        });
    }
}