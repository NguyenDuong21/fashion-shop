const nodemailer = require("nodemailer");

async function sendMailOtp(mailTo, message, subject) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "thien123111888@gmail.com", // generated ethereal user
      pass: "mywnafphxbkoklpk", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "thien123111888@gmail.com", // sender address
    to: `${mailTo}`, // list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
    html: `Xin chào ${mailTo} 👻.<br /> Mã otp của bạn là <b>${message}</b>. </br>Lưu ý: Mã otp chỉ tồn tại trong 1 phút. <br /> Xin chân thành cảm ơn.`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
async function sendMail(mailTo, message, subject) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "thien123111888@gmail.com", // generated ethereal user
      pass: "mywnafphxbkoklpk", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "thien123111888@gmail.com", // sender address
    to: `${mailTo}`, // list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
    html: message, // html body
  });
}
module.exports = { sendMailOtp, sendMail };