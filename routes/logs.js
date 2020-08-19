const express = require('express');
const router = express.Router();
const logging = require('../helpers/logging_helper');

router.get('/', function(req, res) {
    // logging.append_to_log("Calling /logs page")
    logging.query_logs(req, res, 15, 1);
});

module.exports = router;