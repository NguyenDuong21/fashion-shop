const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TypeVoucherSchema = new Schema({
  code: {
    required: true,
    type: String
  },
  Name: {
    required: true,
    type: String
  }
})

module.exports = mongoose.model("TypeVoucher", TypeVoucherSchema, "TypeVoucher");