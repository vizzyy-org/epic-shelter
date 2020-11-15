const express = require('express');
const logging = require('../helpers/logging_helper');
const env = require('../config/environments')
const router = express.Router();

let row = 0;

router.get('/', function(req, res) {
    logging.append_to_log("opened motion page.", req.user ? req.user.displayName : "DEV USER");
    res.render('motion');
});

router.get('/initial', function(req, res) {
    row = 0;
    logging.append_to_log("viewed motion #"+row+".", req.user ? req.user.displayName : "DEV USER");
    sendMotionBuffer(res);
});

router.get('/next', function(req, res) {
    row = row + 1;
    logging.append_to_log("viewed motion #"+row+".", req.user ? req.user.displayName : "DEV USER");
    sendMotionBuffer(res);
});

router.get('/prev', function(req, res) {
    row = row - 1 >= 0 ? row - 1 : row;
    logging.append_to_log( "viewed motion #"+row+".", req.user ? req.user.displayName : "DEV USER");
    sendMotionBuffer(res);
});

function sendMotionBuffer(res){
    let query = `select * from images order by Time desc limit ${row},1;`;

    env.db.query(query, function (error, results, fields) {
        if (error) throw error;

        const record = results[0]; // select first row

        // Got no BLOB data
        if(record===undefined)
            console.log("No result -- ID not in DB?");
        else
            console.log("BLOB data found.");

        res.send(Buffer.from(record.Image).toString('base64'));
    });
}

module.exports = router;