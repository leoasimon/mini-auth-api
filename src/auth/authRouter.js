const express = require("express");

const authService = require("./authService");
const emailService = require("../email/emailService");

const { authMiddleware } = require("./authMiddleware");

const router = express.Router();

router.post("/signin", async (req, res) => {
  const result = await authService.signin(req.body);

  if (result.error) {
    return res.status(result.status).json({
      error: result.error,
    });
  }

  return res.status(result.status).json(result.data);
});

router.post("/signup", async (req, res) => {
  const result = await authService.signup(req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  emailService.sendVerifyEmail(req.body.email, result.data.hash);

  return res.status(result.status).json(result.data);
});

router.get("/authenticate", authMiddleware, (req, res) => {
  return res.json({
    user: req.user,
  });
});

router.post("/verify-email", async (req, res) => {
  const result = await authService.verifyEmail(req.body.email, req.body.hash);

  if (result.error) {
    return res.status(result.status).json({
      error: result.error,
    });
  }

  return res.status(result.status).send();
});

router.post("/forgot-password", async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  if (result.error) {
    return res.status(result.status).json({
      error: result.error,
    });
  }

  emailService.sendResetPasswordEmail(req.body.email, result.token);

  return res.status(200).send();
});

router.post("/reset-password", async (req, res) => {
  const result = await authService.resetPassword(
    req.query.token,
    req.body.password
  );

  if (result.error) {
    return res.status(result.status).json({
      error: result.error,
    });
  }

  return res.status(result.status).json(result.data);
});

router.get("/check-reset-pwd-token", async (req, res) => {
  const result = await authService.checkResetPwdToken(req.query.token);

  if (result.error) {
    return res.status(result.status).json({
      error: result.error,
    });
  }

  return res.status(result.status).send();
});

module.exports = {
  authRouter: router,
};
