const { Schema, model } = require('mongoose');
const OtpGenerator = require('otp-generator');
const { hashPassword, comparePass } = require('../../helper/genkey');
const OtpSchema = new Schema({
  email: String,
  otp: String,
  time: { type: Date, default: Date.now(), index: { expires: 60 } }
});
OtpSchema.statics.genOtp = function() {
  const Otp = OtpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  })
  return Otp;
}
OtpSchema.pre("save", async function(next) {
  try {
    const hashOtp = await hashPassword(this.otp);
    this.otp = hashOtp;
    next();
  } catch (error) {
    next(error);
  }
});
OtpSchema.methods.isValidOtp = async function(otpPlain) {
  return await comparePass(otpPlain, this.otp);
};
module.exports = model("Otp", OtpSchema, "Otp");