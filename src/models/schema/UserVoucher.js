const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const VoucherSchema = require('./Voucher');
const UserVoucherSchema = new Schema({
  userId: String,
  voucher: [{
    id: {
      ref: "Voucher",
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    limit: Boolean,
    status: Boolean,
    _id: false
  }]
}, {
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true }
})
module.exports = mongoose.model("UserVoucher", UserVoucherSchema, "UserVoucher");