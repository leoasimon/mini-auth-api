const express = require("express");
const pg = require("pg");
const waitPort = require("wait-port");

const app = express();
const client = new pg.Client();

app.get("/", (req, res) => {
  res.send("Hello mini Auth Api!");
});

waitPort({
  host: process.env.PGHOST,
  port: 5432,
}).then(() => {
  client.connect().then(() => {
    client
      .query({
        text: "CREATE TABLE IF NOT EXISTS users (id serial primary key, email varchar(255), password varchar(255))",
      })
      .then(() => {
        app.listen(3000, () => {
          console.log("App listening on port 3000");
        });
      });
  });
});
