const express = require('express');
const db_helper = require('../helpers/db_helper')
const router = express.Router();

router.get('/', function(req, res) {
    let query = 'select count(*) as count from images;';

    db_helper.renderInitialMotionAsset(query, res);
});

router.get('/data/:imageId', function(req, res) {
    let query = `select * from images where ID = ?`;
    let params = [req.params.imageId]

    db_helper.sendMotionAssetById(query, params, req, res);
});

module.exports = router;