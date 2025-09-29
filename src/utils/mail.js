import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Collab Track",
      link: "https://collabtrack.com",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailContent);

  const emailHtml = mailGenerator.generate(options.mailContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "arunsinghsnd@gmail.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(
      "Email service failed siliently. Make sure that you have provied your MAILTRAP credentials in the .env file"
    );
    console.log("Error : ", error);
  }
};

// this is contnet of the mail for sending
const emailVerficationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our App! we'are excited to have you on board.",
      action: {
        instructions:
          "To verify your email please click on the following button",
        button: {
          color: "#22BC66",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need hlep, or have questions? Just reply to this email, we'd love to help",
    },
  };
};

// this is the content of the mail for reset password.
const forgotPasswordMailgenContent = (username, passwordRestUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password of your account",
      action: {
        instructions:
          "To reset your password click on the following button or link",
        button: {
          color: "#22bc66",
          text: "Rest password",
          link: passwordRestUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export { emailVerficationMailgenContent, forgotPasswordMailgenContent , sendEmail };


/**
 * 
 * 
 * Register 
 * 
 * 
 * take some data
 * validate the data
 * check in DB if user already exists
 * SAVED the new user
 * user verification => email send
 * 
 * 
 * 
 * 
 * Mail 
 * 
 * preaper the content 
 * send an email
 * test the mail
 * 
 * 
 * 
 * AWS SES
 * Brevo
 */