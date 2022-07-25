const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const invetorySchema = new Schema({
  productId: {
    type: Number,
  },
  quantity: Number,
  reservation: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    quantity: Number
  }]
}, {
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
})
invetorySchema.virtual('productRef', {
  ref: 'ProductStandard',
  localField: 'productId',
  foreignField: 'id'
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
});
module.exports = { InventorySchema: mongoose.model("InventorySchema", invetorySchema, "Inventory") };