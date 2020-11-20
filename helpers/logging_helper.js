const env = require('../config/environments');

module.exports = {
    append_to_log: function (entry_text, user = "DEV-LOG"){
        let user_entry = user ? user + " - " : "" ;
        let final_entry = user_entry + entry_text;

        try {
            let entry = {date: new Date(), message: final_entry, service: "epic-shelter", environment: env.secrets.environment};
            env.db.query('INSERT INTO logs SET ?', entry, function (error, results, fields) {
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
        console.log(final_entry);
    },
    query_logs: function (req, res, page_size, page_num){
        try {
            let offset = (page_num - 1) * page_size;
            env.db.query('SELECT * FROM logs WHERE environment = ? ORDER by ID DESC LIMIT ? OFFSET ?',
                [env.secrets.environment, page_size, offset],
                function (error, results, fields) {
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