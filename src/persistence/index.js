const pg = require("pg");
const waitPort = require("wait-port");

const pool = new pg.Pool();

const initDb = async () => {
  await waitPort({
    host: process.env.PGHOST,
    port: 5432,
  });

  return;
};

module.exports = {
  initDb,
  pool,
};
