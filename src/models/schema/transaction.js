const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = Schema(
  {
    orderId: {
      type: Number,
      ref: "Order",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
  },
  {
    collection: "Transaction", 
    timestamps: true,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }
  }
);

transactionSchema.virtual('TranOrder', {
  ref: 'Order',
  localField: 'orderId',
  foreignField: '_id'
}, { toJSON: { virtuals: true } });
module.exports = mongoose.model("Transaction", transactionSchema);
