const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const { initDb, pool } = require("./persistence");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello mini Auth Api!!!!!");
});

app.get("/users", async (req, res) => {
  const users = await pool.query("SELECT * FROM users");
  res.json(users.rows);
});

app.post("/signin", async (req, res) => {
  const data = await pool.query({
    text: "SELECT * FROM users WHERE email = $1",
    values: [req.body.email],
  });

  if (data.rowCount === 0) {
    return res.status(404).json({
      error: "No user associated with this email adress",
    });
  }

  res.json(data);
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const existingUsers = await pool.query({
    text: "SELECT * FROM users WHERE email = $1",
    values: [email],
  });

  if (existingUsers.rowCount > 0) {
    return res
      .status(400)
      .json({ error: "A user with this email adress already exists" });
  }

  const saltRounds = 10;

  const salt = await bcrypt.genSalt(saltRounds);
  try {
    const hash = await bcrypt.hash(password, salt);
    const user = await pool.query({
      text: "INSERT INTO users(email, password) VALUES($1, $2) RETURNING *",
      values: [email, hash],
    });
    return res.json(user.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const startApp = async () => {
  await initDb();

  app.listen(3000, () => {
    console.log("App listening on port 3000");
  });
};

startApp();
