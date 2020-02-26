const nodemailer = require ('nodemailer');
   
const smtpConfig = {
   host:process.env.SMTP_HOST,
   port:process.env.SMTP_PORT,
   auth: {
       user:process.env.SMTP_USER,
       pass:process.env.SMTP_PASS,
   }
};
const fromConfig = {
   from: `${process.env.SMTP_NAME}<${process.env.SMTP_EMAIL}>`
};
const transporter = nodemailer.createTransport(
   smtpConfig, 
   fromConfig
);

exports.send = async (options) => {
   await transporter.sendMail(options);
};

