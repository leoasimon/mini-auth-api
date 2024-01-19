const express = require("express");
const bcrypt = require("bcrypt");

const { authMiddleware } = require("../auth/authMiddleware");
const { pool } = require("../persistence");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", (req, res) => {
  res.json(req.user);
});

router.delete("/me", async (req, res) => {
  const data = await pool.query({
    text: "SELECT * FROM users WHERE id = $1",
    values: [req.user.id],
  });

  const user = data.rows[0];

  const result = await bcrypt.compare(req.body.password, user.password);

  if (!result) {
    return res.status(400).json({
      error: "Invalid password.",
    });
  }

  await pool.query({
    text: "DELETE FROM users WHERE id = $1",
    values: [user.id],
  });

  res.status(204).send();
});

module.exports = {
  usersRouter: router,
};
