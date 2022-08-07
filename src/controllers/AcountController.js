const { valRegister } = require("../helper/validate-register");
const User = require("../models/schema/user");
const { formatEmail } = require('../helper/Convert');
const { sendMailOtp } = require('../helper/SendEmail');
const { hashPassword } = require("../helper/genkey");
const { InventorySchema } = require("../models/schema/inventory");
const {
  signAccessToken,
  verifyAccessToken,
  signRefreshsToken,
  verifyRefreshToken
} = require('../services/JwtService');
const Otp = require('../models/schema/Otp');
const { client, getAllCart, setAllCart, delAllCart } = require("../services/RedisService");
const loginPage = (req, res) => {
  res.render("xe-mart/login");

};
const registerPage = (req, res) => {
  res.render("xe-mart/register");
}

const loginAccount = async (req, res) => {
  const { email, password } = req.body;
  let notify = '';
  const userLogin = await User.findById(email);
  if (userLogin) {
    try {
      const isValid = await userLogin.isValidPass(password);
      let setCartPromise;
      let delCartPromise;
      let arrPromise = [];
      let cartTemp = null;
      if (isValid) {
        const accessToken = await signAccessToken(userLogin._id);
        const refreshToken = await signRefreshsToken(userLogin._id);
        const cartUser = await client.exists(`cart:${userLogin._id}`);
        if (req.signedCookies.uid) {

          cartTemp = await getAllCart(req.signedCookies.uid);
          if (!cartUser && Object.keys(cartTemp).length > 0) {
            setCartPromise = setAllCart(userLogin._id, cartTemp);
            let keys = Object.keys(cartTemp);

            for (let i = 0; i < keys.length; i++) {
              arrPromise.push(InventorySchema.findOneAndUpdate({
                productId: keys[i],
                quantity: { $gt: cartTemp[keys[i]] }
              }, {
                $inc: {
                  quantity: -cartTemp[keys[i]]
                },
                $push: {
                  reservation: {
                    userId: userLogin._id,
                    quantity: cartTemp[keys[i]]
                  }
                }
              }))
            }
            delCartPromise = delAllCart(req.signedCookies.uid);
          }
        }
        res.cookie('accessToken', accessToken, { signed: true, httpOnly: true, secure: true });
        res.cookie('refreshToken', refreshToken, { signed: true, httpOnly: true, secure: true });
        res.cookie('uid', userLogin._id, { signed: true, httpOnly: true, secure: true });
        if (req.session.redirect) {
          const redirect = req.session.redirect;
          req.session.destroy();
          res.redirect(redirect);
        } else {

          res.redirect('/');
        }
        if (cartTemp && Object.keys(cartTemp).length > 0) {
          await setCartPromise;
          await delCartPromise;
          await Promise.all(arrPromise);
        }
        return;
      } else {
        notify = "Tài khoản hoặc mật khẩu không chính xác";
      }
    } catch (error) {
      console.log(error);
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

const responseOtp = async (req, res, next) => {
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
      await sendMailOtp(email, OtpForUser, "Mã xác nhận đăng ký tài khoản");
      return res.json({ code: "success", message: OtpForUser });

    } else {
      return { code: "error", message: "Có lỗi xảy ra, không thể tạo tài khoản" };
    }
  } catch (error) {
    next(error);
  }
}
const registerAndSendOtp = async (req, res, next) => {
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
const validateOtp = async (req, res) => {
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
const handelFacebookRedirectLogin = (req, res, next) => {
  const _id = req.user;
  return res.send(_id);
}
const handelGoogleRedirectLogin = async (req, res, next) => {
  const _id = req.user;
  try {
    let setCartPromise;
    let delCartPromise;
    let arrPromise = [];
    let cartTemp = null;
    const accessToken = await signAccessToken(_id);
    const refreshToken = await signRefreshsToken(_id);
    const cartUser = await client.exists(`cart:${_id}`);
    if (req.signedCookies.uid) {
      cartTemp = await getAllCart(req.signedCookies.uid);
      if (!cartUser && Object.keys(cartTemp).length > 0) {
        setCartPromise = setAllCart(_id, cartTemp);
        let keys = Object.keys(cartTemp);

        for (let i = 0; i < keys.length; i++) {
          arrPromise.push(InventorySchema.findOneAndUpdate({
            productId: keys[i],
            quantity: { $gt: cartTemp[keys[i]] }
          }, {
            $inc: {
              quantity: -cartTemp[keys[i]]
            },
            $push: {
              reservation: {
                userId: _id,
                quantity: cartTemp[keys[i]]
              }
            }
          }))
        }
        delCartPromise = delAllCart(req.signedCookies.uid);
      }
    }
    res.cookie('accessToken', accessToken, { signed: true, httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { signed: true, httpOnly: true, secure: true });
    res.cookie('uid', _id, { signed: true, httpOnly: true, secure: true });
    if (req.session.redirect) {
      const redirect = req.session.redirect;
      req.session.destroy();
      res.redirect(redirect);
    } else {
      res.redirect('/');
    }
    if (cartTemp && Object.keys(cartTemp).length > 0) {
      await setCartPromise;
      await delCartPromise;
      await Promise.all(arrPromise);
    }
    req.session.destroy();
    return;

  } catch (error) {
    next(error);
  }
}
const logOut = async (req, res, next) => {
  try {
    const refreshToken = req.signedCookies.refreshToken;
    const accessToken = req.signedCookies.accessToken;
    if (!refreshToken || !accessToken) {
      return res.send("Bạn chưa đăng nhập");
    }
    const verify = await verifyRefreshToken(refreshToken);
    if (verify) {
      await client.del(verify.userId);
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      res.clearCookie('uid');
      res.redirect('/login');
    }
  } catch (error) {
    next(error)
  }

}

module.exports = { loginPage, loginAccount, registerPage, registerAndSendOtp, responseOtp, validateOtp, handelGoogleRedirectLogin,handelFacebookRedirectLogin, logOut }