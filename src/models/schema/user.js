const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { hashPassword, comparePass } = require("../../helper/genkey");
const UserSchema = new Schema({
  _id: {
    type: String,
    required: [true, "Email can't blank"],
    match: [/\S+@\S+\.\S+/, "Email invalid format"],
    indexes: true,
  }, // _id is email of user
  userName: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  hashedAndSaltedPassword: {
    type: String,
    default: ''
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    default: ''
  }
});
// UserSchema.pre("save", async function(next) {
//   try {
//     const hash = await hashPassword(this.hashedAndSaltedPassword);
//     this.hashedAndSaltedPassword = hash;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });
UserSchema.methods.isValidPass = async function(passwordPlain) {
  return await comparePass(passwordPlain, this.hashedAndSaltedPassword);
};
module.exports = mongoose.model("Users", UserSchema);