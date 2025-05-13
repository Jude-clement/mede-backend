const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'jude@qawebprints.com',    // Your Gmail
    pass: 'qary rben jrbn fhmt'  // Your App Password
  }
});

transporter.sendMail({
  from: 'jude@qawebprints.com',
  to: 'judeclement72@gmail.com',  // Change this
  subject: 'SMTP Test',
  text: 'If you see this, your config works!'
}).then(console.log).catch(console.error);