const bcrypt = require("bcrypt");
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
    const hash = await bcrypt.hash(password, salt);
    const response = await pool.query({
      text: "INSERT INTO users(email, password) VALUES($1, $2) RETURNING *",
      values: [email, hash],
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

module.exports = {
  signup,
};
