const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cart: {
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
            type: Number,
            default: 0,
          },
          title: {
            type: String,
          },
          productCode: {
            type: String,
          },
        },
      ],
    },
    address: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: false,
    },
    Delivered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
