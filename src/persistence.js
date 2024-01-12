const pg = require("pg");
const waitPort = require("wait-port");

const pool = new pg.Pool();

const initDb = async () => {
  await waitPort({
    host: process.env.PGHOST,
    port: 5432,
  });

  await pool.query({
    text: "CREATE TABLE IF NOT EXISTS users (id serial primary key, email varchar(255), password varchar(255))",
  })

  return ;
};

module.exports = {
  initDb,
  pool
}
