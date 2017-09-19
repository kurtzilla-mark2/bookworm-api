import nodemailer from 'nodemailer';

const from = '"Bookworm" <info@bookworm.com>';

function setup() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });  
}

export function sendConfirmationEmail(user) {
  const transport = setup();
  const email = {
    from,
    to: user.email,
    subject: "Welcome to Bookworm",
    text: `
    Welcome to Bookworm. Please confirm your email.

    ${user.generateConfirmationUrl()}
    `
  };

  transport.sendMail(email);
}

export function sendResetPasswordEmail(user) {
  const transport = setup();
  const email = {
    from,
    to: user.email,
    subject: "Reset Password",
    text: `
    Follow the link to reset your password.

    ${user.generateResetPasswordLink()}
    `
  };

  transport.sendMail(email);
}

export function sendResetPasswordNotificationEmail(user) {
  const transport = setup();
  const email = {
    from,
    to: user.email,
    subject: "Your Password has been reset",
    text: `
    Your password has been successfully updated.

    If you did not request this password change or believe you're receiving this email in 
    error, please contact us for immediate assistance.

    `
  };

  transport.sendMail(email);
}