const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const authService = require("./authService");
const emailService = require("../email/emailService");

const { pool } = require("../persistence");
const { authMiddleware } = require("./authMiddleware");

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

  const token = jwt.sign(rest, process.env.JWTSECRET);

  return res.json({
    token,
    user: rest,
  });
});

router.post("/signup", async (req, res) => {
  const result = await authService.signup(req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  emailService.sendVerifyEmail(req.body.email);

  return res.status(result.status).json(result.data);
});

router.get("/authenticate", authMiddleware, (req, res) => {
  return res.json({
    user: req.user,
  });
});

module.exports = {
  authRouter: router,
};
