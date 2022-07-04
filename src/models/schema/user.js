const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { hashPassword, comparePass } = require("../../helper/genkey");
const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email can't blank"],
    match: [/\S+@\S+\.\S+/, "Email invalid format"],
    indexes: true,
  },
  image: String,
  password: {
    type: String,
    required: true,
  },
  salt: String,
});
UserSchema.pre("save", async function (next) {
  try {
    const { hash, salt } = await hashPassword(this.password);
    this.password = hash;
    this.salt = salt;
    next();
  } catch (error) {
    next(error);
  }
});
UserSchema.methods.isValidPass = async function (passwordPlain) {
  return await comparePass(passwordPlain, this.password);
};
module.exports = mongoose.model("Users", UserSchema);
