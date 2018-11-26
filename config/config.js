require('dotenv').config(); // require dotenv in order to parse environment variables

module.exports = {
    development: {
        "username": DB_USER,
        "password": DB_PASS,
        "database": DB_DEV,
        "host": DB_HOST,
        "dialect": "mysql"
    },
    test: {
        "username": DB_USER,
        "password": DB_PASS,
        "database": DB_TEST,
        "host": DB_HOST,
        "dialect": "mysql"
    },
    production: {
        "username": DB_USER,
        "password": DB_PASS,
        "database": DB_PROD,
        "host": DB_HOST,
        "dialect": "mysql"
    }
}