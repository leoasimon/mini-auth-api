const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { pool } = require("../persistence");

const signup = async (body) => {
  const { email, password } = body;

  const existingUsers = await pool.query({
    text: "SELECT * FROM users WHERE email = $1",
    values: [email],
  });

  if (existingUsers.rowCount > 0) {
    return {
      status: 400,
      error: "A user with this email adress already exists",
    };
  }

  const saltRounds = 10;

  const salt = await bcrypt.genSalt(saltRounds);

  try {
    const pwdHash = await bcrypt.hash(password, salt);
    const emailHash = await bcrypt.hash(email, salt);

    const response = await pool.query({
      text: "INSERT INTO users(email, password, hash) VALUES($1, $2, $3) RETURNING *",
      values: [email, pwdHash, emailHash],
    });

    const user = response.rows[0];
    return {
      status: 200,
      data: user,
    };
  } catch (err) {
    return {
      status: 500,
      error: err.message,
    };
  }
};

const signin = async (body) => {
  const data = await pool.query({
    text: "SELECT * FROM users WHERE email = $1",
    values: [body.email],
  });

  if (data.rowCount === 0) {
    return {
      status: 404,
      error: "No user associated with this email adress",
    };
  }

  const user = data.rows[0];

  const result = await bcrypt.compare(body.password, user.password);

  if (!result) {
    return {
      status: 400,
      error: "Invalid login credentials.",
    };
  }

  const { password, status, ...rest } = user;

  if (status === "pending_validation") {
    return {
      status: 400,
      error:
        "Please check your inbox for a verification email and follow the instructions to complete the verification process.",
    };
  }

  if (status === "pending_password_reset") {
    return {
      status: 400,
      error:
        "Please check your inbox for a password reset email and follow the instructions to complete the password reset process.",
    };
  }

  if (status === "active") {
    const token = jwt.sign(rest, process.env.JWTSECRET);

    return {
      data: {
        token,
        user: rest,
      },
      status: 200,
    };
  }
};

const verifyEmail = async (email, hash) => {
  const result = await pool.query({
    text: "SELECT * from users WHERE email=$1 AND hash=$2 AND status=$3",
    values: [email, hash, "pending_validation"],
  });

  if (result.rowCount === 0) {
    return {
      status: 404,
      error: "Unable to find a match for this user and hash",
    };
  }

  const user = result.rows[0];

  const updateResult = await pool.query({
    text: "UPDATE users SET status = $1 WHERE id = $2",
    values: ["active", user.id],
  });

  return {
    status: 200,
  };
};

const forgotPassword = async (email) => {
  const result = await pool.query({
    text: "SELECT * FROM users WHERE email = $1",
    values: [email],
  });

  if (result.rowCount === 0) {
    return {
      status: 404,
      error: "No user associated with this email adress",
    };
  }

  const token = jwt.sign({ email }, process.env.JWTSECRET, {
    expiresIn: "1h",
  });

  await pool.query({
    text: "UPDATE users SET status = $1 WHERE email = $2",
    values: ["pending_password_reset", email],
  });

  return {
    token,
  };
};

const checkResetPwdToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);

    const result = await pool.query({
      text: "SELECT * FROM users WHERE email = $1 AND status = $2",
      values: [decoded.email, "pending_password_reset"],
    });

    if (result.rowCount === 0) {
      return {
        status: 404,
        error: "This token is invalid or has expired",
      };
    }

    return {
      status: 200,
    };
  } catch (err) {
    return {
      status: 400,
      error: err.message,
    };
  }
};

const resetPassword = async (token, password) => {
  const checked = await checkResetPwdToken(token);

  if (checked.status !== 200) {
    return checked;
  }

  const saltRounds = 10;

  const salt = bcrypt.genSaltSync(saltRounds);

  const pwdHash = bcrypt.hashSync(password, salt);

  await pool.query({
    text: "UPDATE users SET password = $1, status = $2 WHERE email = $3",
    values: [pwdHash, "active", decoded.email],
  });

  return {
    status: 200,
  };
};

module.exports = {
  signup,
  signin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkResetPwdToken
};
