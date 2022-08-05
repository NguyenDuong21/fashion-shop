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
  amount: {
    type: Number,
    default: 0
  },
  limit: Boolean,
  from: Number,
  unit: String,
  discount: Number,
  max: {
    type: Number,
    default: 0
  },
  startDate: { type: Date, require: true, default: "" },
  expireDate: { type: Date, require: true, default: "" },
  Status: Boolean
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true }
})
VoucherSchema.virtual('VoucherProduct', {
  ref: 'ProductStandard',
  localField: 'productId',
  foreignField: 'id'
}, { toJSON: { virtuals: true } });
module.exports = mongoose.model("Voucher", VoucherSchema, "Voucher");