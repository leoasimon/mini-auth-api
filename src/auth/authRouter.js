const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { pool } = require("../persistence");

const router = express.Router();

router.post("/signin", async (req, res) => {
  const data = await pool.query({
    text: "SELECT * FROM users WHERE email = $1",
    values: [req.body.email],
  });

  if (data.rowCount === 0) {
    return res.status(404).json({
      error: "No user associated with this email adress",
    });
  }

  const user = data.rows[0];

  const result = await bcrypt.compare(req.body.password, user.password);

  if (!result) {
    return res.status(400).json({
      error: "Invalid login credentials.",
    });
  }

  const { password, ...rest } = user;

  const token = jwt.sign(rest, "secretPrivateKey");

  return res.json({
    token,
    user: rest,
  });
});

router.post("/signup", async (req, res) => {
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

module.exports = {
    authRouter: router
}