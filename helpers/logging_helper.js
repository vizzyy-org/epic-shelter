const env = require('../config/environments');
const mysql = require("mysql");

module.exports = {
    append_to_log: function (entry_text, user = "DEV-LOG"){
        let user_entry = user ? user + " - " : "" ;
        let final_entry = user_entry + entry_text;

        if (["prod", "test"].includes(env.secrets.environment)) {
            try {
                let db_conn = mysql.createConnection(env.db_config);
                let entry = {date: new Date(), message: final_entry, service: "epic-shelter"};
                db_conn.query('INSERT INTO logs SET ?', entry, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        return error
                    }
                    return results;
                });
            } catch (e) {
                console.log(e);
                return e;
            }
        }
        console.log(final_entry);
    },
    query_logs: function (req, res, page_size, page_num){
        try {
            let db_conn = mysql.createConnection(env.db_config);
            let offset = (page_num - 1) * page_size;
            db_conn.query('SELECT *  FROM logs ORDER by ID DESC LIMIT '+page_size+' OFFSET ' + offset, function (error, results, fields) {
                if (error) {
                    if(env.secrets.environment === "dev")
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