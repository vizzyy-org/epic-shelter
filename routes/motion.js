const express = require('express');
const env = require('../config/environments')
const router = express.Router();

let recordCount = -1;

router.get('/', function(req, res) {
    renderInitialMotionAsset(res);
});

router.get('/data/:imageId', function(req, res) {
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
    let query = `select * from images where ID = ?`;

    env.db.query(query, [id], function (error, results, fields) {
        if (error) throw error;

        const record = results[0]; // select first row

        // Got no BLOB data
        if(record===undefined) {
            console.log("No result -- ID not in DB?");
            res.status(404).send(null);
        } else {
            console.log("BLOB data found.");
            res.send({
                'buffer': Buffer.from(record.Image).toString('base64'),
                'timestamp': record.Time.split("-event")[0]
            });
        }
    });
}

module.exports = router;