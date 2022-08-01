const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  items: [{
    productId: {
      type: Number,
      ref: "Products",
    },
    qty: {
      type: Number,
      default: 0,
    },
    // price: {
    //   type: Number,
    //   default: 0,
    // },
    // productCode: {
    //   type: String,
    // },
    // img: {
    //   type: String,
    // },
  }, ],
  totalQty: {
    type: Number,
    default: 0,
    required: true,
  },
  totalCost: {
    type: Number,
    default: 0,
    required: true,
  },
  user: {
    type: String,
    ref: "Users",
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);