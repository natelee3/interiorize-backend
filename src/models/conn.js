'use strict';

require('dotenv').config();

const host = process.env.DB_HOST;
const database = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const { CONNECTION } = process.env;

const pgp = require('pg-promise')({
    query: function(event) {
        console.log("QUERY: ", event.query);
    },
    error(err, e) {

        if (e.cn) {
            console.log('Connection related: ', e.cn)
            // this is a connection-related error
            // cn = safe connection details passed into the library:
            //      if password is present, it is masked by #
        }

        if (e.query) {
            console.log('e.query: ', e.query)
            if (e.params) {
                console.log(e.params)
            }
        }

        if (e.ctx) {
            console.log('e.ctx: ', e.ctx)
            // occurred inside a task or transaction
        }
      }
});

const options = {
    host,
    port: 5432,
    database,
    user,
    password,
    // ssl: false
};

const db = pgp(options);
// const db = pgp(CONNECTION);

module.exports = db;