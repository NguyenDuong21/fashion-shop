const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: true,
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
    qty: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
  }],
  status: {
    type: String,
    required: true,
  },
  isPay: { type: Boolean, require: true, default: false },
  subTotal: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  discount: {
    type: Schema.Types.Decimal128,
  },
  total: {
    type: Schema.Types.Decimal128,
  },
  name: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
}, { collection: "Order", timestamps: true });

module.exports = mongoose.model("Order", orderSchema);