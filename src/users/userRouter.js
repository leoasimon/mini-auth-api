const express = require("express");

const { authMiddleware } = require("../auth/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", (req, res) => {
  res.json(req.user);
});

module.exports = {
  usersRouter: router,
};
