const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdjustInventorySchema = new Schema({
  id: Number,
  Status: String,
  reason : String,
  Product: [{
    id: Number,
    amount: Number,
    typeAdjust: String,
    _id: false
  }],
  note: String
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true }
});
AdjustInventorySchema.virtual('AdjustProduct', {
  ref: 'ProductStandard',
  localField: 'Product.id',
  foreignField: 'id'
}, { toJSON: { virtuals: true } });
module.exports = mongoose.model("AdjustInventory", AdjustInventorySchema, "AdjustInventory");