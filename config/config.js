require("dotenv").config();

module.exports = {
    "development": 
    {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASS,
        "database": process.env.DB_DEV,
        "host": process.env.DB_HOST,
        "dialect": "mysql"
    },
    "test": 
	{
    "username": process.env.DB_USER,
        "password": process.env.DB_PASS,
        "database": process.env.DB_TEST,
        "host": process.env.DB_HOST,
        "dialect": "mysql"
    },
    "production": 
    {
        "use_env_variable": "JAWSDB_URL",
        "dialect": "mysql"
    }
}
