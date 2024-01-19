const nodemailer = require("nodemailer");
const fs = require("node:fs/promises");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "ubaldo.boyle27@ethereal.email",
    pass: "ab5Z7vpG9qj1CrfFcG",
  },
});

const sendVerifyEmail = async (email) => {
  try {
    const [html, text] = await Promise.all([
      fs.readFile(`${__dirname}/verifyEmailTemplate.html`),
      fs.readFile(`${__dirname}/verifyEmailTemplate.txt`),
    ]);

    const mailOptions = {
      from: "doNotReply@miniauth.com",
      to: email,
      subject: "Confirm Your Email Address for Mini auth",
      text: "" + text,
      html: "" + html,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
      } else {
        console.log(info);
      }
    });
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
    sendVerifyEmail
}