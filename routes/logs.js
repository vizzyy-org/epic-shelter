const express = require('express');
const router = express.Router();
const db_helper = require('../helpers/db_helper');
const env = require('../config/environments')

router.get('/', function(req, res) {
    let page_num = req.query.page_num > 0 ? req.query.page_num : 1;

    db_helper.query_logs(env.log_page_size, page_num).then(results => {
        res.render('logs', {
            log_entries: results.log_entries,
            page_size: results.page_size,
            page_num: results.page_num
        });
    }).catch(function(err){
        console.error(err);
        res.redirect('/error');
    });
});

module.exports = router;