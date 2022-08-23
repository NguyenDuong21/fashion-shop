const mongoose = require("mongoose");

const HistoryChangeInventorySchema = new mongoose.Schema({
  adjustId: Number,
  productId: Number,
  typeChange: String,
  reasonChange: String,
  amountChange: Number,
  userChange: Number
}, { timestamps: true });
module.exports = mongoose.model("HistoryChangeInventory", HistoryChangeInventorySchema, "HistoryChangeInventory");