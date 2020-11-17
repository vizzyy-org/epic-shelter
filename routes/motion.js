const express = require('express');
const logging = require('../helpers/logging_helper');
const env = require('../config/environments')
const router = express.Router();

let recordCount = -1;

router.get('/', function(req, res) {
    logging.append_to_log("opened motion page.", req.user ? req.user.displayName : "DEV USER");
    renderInitialMotionAsset(res);
});

router.get('/data/:imageId', function(req, res) {
    logging.append_to_log("viewed motion #"+req.params.imageId+".", req.user ? req.user.displayName : "DEV USER");
    sendMotionAssetById(res, req.params.imageId);
});

function renderInitialMotionAsset(res = null){
    let query = 'select count(*) as count from images;';

    env.db.query(query, function (error, results, fields) {
        if (error) throw error;

        const record = results[0]; // select first row

        // Got no BLOB data
        if(record===undefined)
            console.log("No result found getting record record.");
        else
            console.log("Motion Assets Count: "+record.count);

        recordCount = record.count;
        res.render('motion', { recordCount: recordCount});
    });
}

function sendMotionAssetById(res, id){
    let query = `select * from images where ID = ${id};`;

    env.db.query(query, function (error, results, fields) {
        if (error) throw error;

        const record = results[0]; // select first row

        // Got no BLOB data
        if(record===undefined) {
            console.log("No result -- ID not in DB?");
            res.status(404).send(null);
        } else {
            console.log("BLOB data found.");
            res.send(Buffer.from(record.Image).toString('base64'));
        }
    });
}

module.exports = router;