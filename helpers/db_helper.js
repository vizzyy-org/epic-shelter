const mysql = require('mysql');
const env = require('../config/environments');

//create mysql connection pool
let connection = mysql.createPool(
    env.db_config
);

// Attempt to catch disconnects
connection.on('connection', function (connection) {
    console.log('DB Connection established');

    connection.on('error', function (err) {
        console.error(new Date(), 'MySQL error', err.code);
    });
    connection.on('close', function (err) {
        console.error(new Date(), 'MySQL close', err);
    });

});

module.exports = {
    append_to_log: function (entry_text, user = "DEV-LOG"){
        return new Promise(function(resolve, reject) {
            let user_entry = user ? user + " - " : "";
            let final_entry = user_entry + entry_text;

            try {
                let entry = {
                    date: new Date(),
                    message: final_entry,
                    service: "epic-shelter",
                    instance: env.instance_id,
                    environment: env.secrets.environment
                };
                connection.query('INSERT INTO logs SET ?', entry, function (error, results, fields) {
                    if (error)
                        reject(error)
                    else
                        resolve(results);
                });
            } catch (e) {
                reject(e);
            }
            console.log(final_entry)
        });
    },
    query_logs: function(page_size, page_num) {
        return new Promise(function(resolve, reject) {
            let offset = (page_num - 1) * page_size;

            connection.query('SELECT * FROM logs WHERE environment = ? ORDER by ID DESC LIMIT ? OFFSET ?',
                [env.secrets.environment, page_size, offset],
                function (error, results) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve({
                            log_entries: results,
                            page_size: page_size,
                            page_num: page_num
                        })
                    }
                }
            );
        });
    },
    metrics_canary: function() {
        return new Promise(function(resolve, reject) {

            connection.query('select * from graphing_data.server_metrics order by id desc limit 5', [],
                function (error, results) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve({
                            results: results
                        })
                    }
                }
            );
        });
    },
    renderInitialMotionAsset: function (query){
        return new Promise(function(resolve, reject) {
            try {
                let query = 'select count(*) as count from images;';

                connection.query(query, function (error, results, fields) {
                    if (error) {
                        reject(error)
                    } else {

                        const record = results[0]; // select first row

                        // Got no BLOB data
                        if (record === undefined)
                            console.log("No result found getting record record.");
                        else
                            console.log("Motion Assets Count: " + record.count);

                        resolve(record.count);
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    },
    sendMotionAssetById: function (imageId){
        return new Promise(function(resolve, reject) {
            try {
                let query = `select * from images where ID = ?`;

                connection.query(query, [imageId], function (error, results) {
                    if (error) {
                        reject(error)
                    } else {
                        const record = results[0]; // select first row

                        // Got no BLOB data
                        if (record === undefined) {
                            console.log("No result -- ID not in DB?");
                            reject(new Error("Record not found."))
                        } else {
                            console.log("BLOB data found.");
                            resolve(record);
                        }
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}