const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VoucherSchema = new Schema({
  type: {
    ref: "TypeVoucher",
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  productId: [{
    ref: "ProductStandard",
    type: Number,
  }],
  amount: Number,
  limit: Boolean,
  from: Number,
  unit: String,
  discount: Number,
  max: Number,
  startDate: { type: Date, require: true, default: "" },
  expireDate: { type: Date, require: true, default: "" },
  Status: Boolean
}, { timestamps: true })

module.exports = mongoose.model("Voucher", VoucherSchema, "Voucher");