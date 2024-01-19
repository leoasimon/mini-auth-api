const pg = require("pg");
const waitPort = require("wait-port");

const pool = new pg.Pool();

const initDb = async () => {
  await waitPort({
    host: process.env.PGHOST,
    port: 5432,
  });

  await pool.query({
    text: "CREATE TABLE IF NOT EXISTS users (id serial primary key, email varchar(255) NOT NULL, password varchar(255) NOT NULL, hash varchar(255) NOT NULL, active BOOLEAN NOT NULL DEFAULT false)",
  });

  return;
};

module.exports = {
  initDb,
  pool,
};
