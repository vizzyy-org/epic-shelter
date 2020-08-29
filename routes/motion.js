const express = require('express');
const logging = require('../helpers/logging_helper');
const env = require('../config/environments')
const router = express.Router();

let row = 0;

router.get('/', function(req, res) {
    logging.append_to_log(req.user.displayName + " opened motion page.");
    row = 0;
    let image = getMotionBuffer();
    res.render('motion', {
        image : image
    });
});

router.get('/next', function(req, res) {
    row = row + 1;
    logging.append_to_log(req.user.displayName + " viewed motion #"+row+".");
    res.send(getMotionBuffer());
});

router.get('/prev', function(req, res) {
    row = row - 1 >= 0 ? row - 1 : row;
    logging.append_to_log(req.user.displayName + " viewed motion #"+row+".");
    res.send(getMotionBuffer());
});

function getMotionBuffer(){
    let query = `select * from images order by Time desc limit ${row},1;`;
    let resp = env.sdb.query(query);

    const record = resp[0]; // select first row

    // Got no BLOB data
    if(record===undefined)
        console.log("No result -- ID not in DB?");
    else
        console.log("BLOB data found.");

    return Buffer.from(record.Image).toString('base64');
}

module.exports = router;