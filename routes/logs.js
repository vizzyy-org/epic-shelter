const express = require('express');
const router = express.Router();
const logging = require('../helpers/db_helper');
const env = require('../config/environments')

router.get('/', function(req, res) {
    let page_num = req.query.page_num > 0 ? req.query.page_num : 1;
    logging.query_logs(req, res, env.log_page_size, page_num);
});

module.exports = router;