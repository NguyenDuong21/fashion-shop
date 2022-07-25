const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderDetailSchema = Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
        },
        qty: {
          type: Number,
          default: 0,
        },
        price: {
          type: Schema.Types.Decimal128,
          default: 0,
        },
        img: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { collection: "OrderDetail", timestamps: true }
);

module.exports = mongoose.model("OrderDetail", orderDetailSchema);
