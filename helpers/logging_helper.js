const secrets = require('../config/secrets')

module.exports = {
    append_to_log: function (entry_text){
        try {
            console.log(entry_text);
            let entry  = {date: new Date(), message: entry_text, service: "epic-shelter"};
            let query = secrets.db.query('INSERT INTO logs SET ?', entry, function (error, results, fields) {
                if (error) {
                    console.log(error);
                    return error
                }
                // console.log(results);
                // console.log(query.sql);
                return results;
            });
        } catch (e) {
            console.log(e);
            return e;
        }
    },
    query_logs: function (req, res, page_size, page_num){
        try {
            let offset = (page_num - 1) * page_size;
            secrets.db.query('SELECT *  FROM logs ORDER by ID DESC LIMIT '+page_size+' OFFSET ' + offset, function (error, results, fields) {
                if (error) {
                    console.log(error);
                    res.end();
                }
                res.render('logs', {
                    log_entries: results,
                    page_size: page_size,
                    page_num: page_num
                });
            });
        } catch (e) {
            console.log(e);
            res.end();
        }
    }
}