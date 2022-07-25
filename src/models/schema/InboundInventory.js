const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const InboundInventorySchema = new Schema({
  id: Number,
  Supplier: String,
  DateImport: Date,
  Status: String,
  Product: [{
    id: Number,
    amount: Number,
    price: Number,
    _id: false
  }],
  total: Number,
  note: String
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true }
});
InboundInventorySchema.virtual('ImportProduct', {
  ref: 'ProductStandard',
  localField: 'Product.id',
  foreignField: 'id'
}, { toJSON: { virtuals: true } });
module.exports = mongoose.model("InboundInventory", InboundInventorySchema, "InboundInventory");