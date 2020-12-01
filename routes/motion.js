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
        res.send({
            'buffer': Buffer.from(result.Image).toString('base64'),
            'timestamp': result.Time.split("-event")[0]
        });
    }).catch(function(err) {
        res.status(404).send(err);
        console.error(err);
    });
});

module.exports = router;