const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    node_env : process.env.NODE_ENV,
    db_user : process.env.DB_USER,
    db_password : process.env.DB_PASSWORD,
    db_name : process.env.DB,
    imgbb_key : process.env.IMGBB
}