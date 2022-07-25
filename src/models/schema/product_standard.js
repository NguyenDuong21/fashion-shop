const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductStandardSchema = new Schema({
  id: Number,
  name: String,
  url_path: String,
  description: String,
  price: Schema.Types.Decimal128,
  parent: {
    type: Number,
    default: 0
  },
  child: [Number],
  modelID: {
    type: mongoose.Schema.Types.ObjectId
  },
  discountRange: {
    type: [{
      from: Number,
      to: Number,
      price: Schema.Types.Decimal128
    }],
    default: undefined
  },
  specs: {
    type: [{
      code: String,
      k: String,
      v: String,
      _id: false
    }],
    default: undefined
  },
  classifys: {
    type: [{
      name: String,
      options: [String],
      _id: false
    }],
    default: undefined
  },
  models: {
    type: [{
      name: String,
    }],
    default: undefined
  },
  img: {
    type: [String],
    default: undefined
  },
  breadcrumbs: {
    type: [{
      url: String,
      name: String,
      catid: Number,
      level: Number,
      _id: false
    }],
    default: undefined
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
})


ProductStandardSchema.statics.findChildModel = async function(modelId) {
  return await this.model('ProductStandard').findOne({ modelID: modelId });
}
ProductStandardSchema.methods.findChild = async function() {
  return await this.model('ProductStandard').find({ parent: this.id });
}
ProductStandardSchema.virtual('Parent', {
  ref: 'ProductStandard',
  localField: 'parent',
  foreignField: 'id'
}, { toJSON: { virtuals: true } });
ProductStandardSchema.virtual('ListChild', {
  ref: 'ProductStandard',
  localField: 'child',
  foreignField: 'id'
}, { toJSON: { virtuals: true } });
ProductStandardSchema.virtual('RealInventory', {
  ref: 'InventorySchema',
  localField: 'id',
  foreignField: 'productId'
}, { toJSON: { virtuals: true } });
module.exports = { ProductStandardSchema: mongoose.model('ProductStandard', ProductStandardSchema, 'ProductStandard') }