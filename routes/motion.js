const express = require('express');
const db_helper = require('../helpers/db_helper')
const router = express.Router();

router.get('/', function(req, res) {
    db_helper.renderInitialMotionAsset().then(recordCount => {
        res.render('motion', {recordCount: recordCount});
    }).catch(function (err) {
        console.error(err);
        res.redirect('/error');
    });
});

router.get('/data/:imageId', function(req, res) {
    db_helper.sendMotionAssetById(req.params.imageId).then(result => {
        // incoming Time string will be something like:
        // 2020-12-31-21:10:11-event1
        let timestamp = result.Time.split("-event")[0]
        let date = timestamp.substring(0, 10)
        let time = timestamp.substring(11)

        res.send({
            'buffer': Buffer.from(result.Image).toString('base64'),
            'time': time,
            'date': date,
            'timestamp': timestamp
        });
    }).catch(function(err) {
        console.error(err);
        res.status(404).send("An exception occurred");
    });
});

module.exports = router;