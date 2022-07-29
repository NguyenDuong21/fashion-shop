const { valRegister } = require("../helper/validate-register");
const User = require("../models/schema/user");
const { formatEmail } = require('../helper/Convert');
const { sendMailOtp } = require('../helper/SendEmail');
const { hashPassword } = require("../helper/genkey");
const {
  signAccessToken,
  verifyAccessToken,
  signRefreshsToken,
  verifyRefreshToken
} = require('../services/JwtService');
const Otp = require('../models/schema/Otp');
const loginPage = (req, res) => {
  if (!req.session.user) {
    res.render("xe-mart/login");
  } else {
    res.redirect("/");
  }
};
const registerPage = (req, res) => {
  res.render("xe-mart/register");
}

const loginAccount = async(req, res) => {
  const { email, password } = req.body;
  let notify = '';
  const userLogin = await User.findById(email);
  if (userLogin) {
    try {
      const isValid = await userLogin.isValidPass(password);
      if (isValid) {
        const accessToken = await signAccessToken(userLogin._id);
        const refreshToken = await signRefreshsToken(userLogin._id);
        console.log({ accessToken, refreshToken });
        res.cookie('accessToken', accessToken, { signed: true, httpOnly: true, secure: true });
        res.cookie('refreshToken', refreshToken, { signed: true, httpOnly: true, secure: true });
        return res.redirect('/');
      } else {
        notify = "Tài khoản hoặc mật khẩu không chính xác";
      }
    } catch (error) {
      return res.send({
        status: 500,
        message: error.message,
      });
    }
  } else {
    notify = "Tài khoản hoặc mật khẩu không chính xác";
  }
  res.render("xe-mart/login", { notify, email });
};

const responseOtp = async(req, res, next) => {
  const { email } = req.body;
  const _id = email;
  try {
    let userRegister = await User.findOne({ _id });
    if (userRegister) {
      return res.json({ code: "error", message: "Email này đã tồn tại trong hệ thống" });
    }
    userRegister = new User({ _id });
    const OtpForUser = Otp.genOtp();
    const OtpPromist = new Otp({ email: _id, otp: OtpForUser });
    const OtpPromistSave = OtpPromist.save();
    const userRegisterted = await userRegister.save();
    if (userRegisterted) {
      const Otp = await OtpPromistSave;
      await sendMailOtp(email, OtpForUser);
      return res.json({ code: "success", message: OtpForUser });

    } else {
      return { code: "error", message: "Có lỗi xảy ra, không thể tạo tài khoản" };
    }
  } catch (error) {
    next(error);
  }
}
const registerAndSendOtp = async(req, res, next) => {
  const { userName, email, phoneNumber, password, repassword } = req.body;
  try {
    if (password === repassword) {
      const hashedAndSaltedPassword = await hashPassword(password);
      let userRegister = await User.findOneAndUpdate({ _id: email, emailVerified: true }, { userName, phoneNumber, hashedAndSaltedPassword });
      if (!userRegister) {
        return res.send({ code: 404, message: "Email không chính xác" });
      }
      return res.redirect('/login');
    }
  } catch (error) {
    next(error);
  }
}
const validateOtp = async(req, res) => {
  const { plantOtp, email } = req.body;
  try {
    const otpHolder = await Otp.find({ email })
    if (!otpHolder) {
      return res.json({ code: "error", message: "Otp đã hết hạn" });
    }
    const lastOtp = otpHolder.at(-1);
    const isValidOtp = await lastOtp.isValidOtp(plantOtp);
    if (!isValidOtp) {
      return res.json({ code: "error", message: "Otp không chính xác" });
    }
    if (isValidOtp && lastOtp.email === email) {
      await Otp.deleteMany({ email });
      const updatedUser = await User.findOneAndUpdate({ _id: email }, { emailVerified: true });
      if (updatedUser) {
        return res.json({ code: "success", massage: "Xác thực Otp thành công" });
      } else {
        return res.json({ code: "error", massage: "Có lỗi xảy ra. Vui lòng thử lại!" });
      }
    }
  } catch (error) {
    next(error);
  }
}
module.exports = { loginPage, loginAccount, registerPage, registerAndSendOtp, responseOtp, validateOtp }