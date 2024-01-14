const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const { auth_token } = req.headers;

  try {
    const user = jwt.verify(auth_token, "secretPrivateKey");

    if (!user) {
      return res.status(403).json({
        error:
          "Permission Denied: You are not authorized to access this resource.",
      });
    }

    req.user = user;
    next();
  } catch (e) {
    console.log(e);
    return res.status(403).json({
      error:
        "Permission Denied: You are not authorized to access this resource.",
    });
  }
};

module.exports = {
  authMiddleware,
};