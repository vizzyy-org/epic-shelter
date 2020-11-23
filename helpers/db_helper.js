const mysql = require('mysql');
const env = require('../config/environments');

let recordCount = -1;
let connection;

function handleDisconnect() {
    connection = mysql.createConnection(env.db_config);

    connection.connect(function(err) {
        if(err) {
            console.log('Error when connecting to DB: ', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    connection.on('error', function(err) {
        console.log('Problem with DB connection: ', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = {
    append_to_log: function (entry_text, user = "DEV-LOG"){
        let user_entry = user ? user + " - " : "" ;
        let final_entry = user_entry + entry_text;

        try {
            let entry = {date: new Date(), message: final_entry, service: "epic-shelter", environment: env.secrets.environment};
            connection.query('INSERT INTO logs SET ?', entry, function (error, results, fields) {
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
            connection.query('SELECT * FROM logs WHERE environment = ? ORDER by ID DESC LIMIT ? OFFSET ?',
                [env.secrets.environment, page_size, offset],
                function (error, results, fields) {
                    if (error) {
                        if(env.secrets.environment === "dev")
                            console.log(error);
                        res.end();
                        return
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
    },
    renderInitialMotionAsset: function (query, res){
        try {
            connection.query(query, function (error, results, fields) {
                if (error) throw error;

                const record = results[0]; // select first row

                // Got no BLOB data
                if(record===undefined)
                    console.log("No result found getting record record.");
                else
                    console.log("Motion Assets Count: "+record.count);

                recordCount = record.count;
                res.render('motion', { recordCount: recordCount});
            });
        } catch (e) {
            console.log(e);
            res.end();
        }
    },
    sendMotionAssetById: function (query, params, req, res){
        try {
            connection.query(query, params, function (error, results, fields) {
                if (error) throw error;

                const record = results[0]; // select first row

                // Got no BLOB data
                if(record===undefined) {
                    console.log("No result -- ID not in DB?");
                    res.status(404).send(null);
                } else {
                    console.log("BLOB data found.");
                    res.send({
                        'buffer': Buffer.from(record.Image).toString('base64'),
                        'timestamp': record.Time.split("-event")[0]
                    });
                }
            });
        } catch (e) {
            console.log(e);
            res.end();
        }
    }
}