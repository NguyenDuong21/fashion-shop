const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema({
  _id: Number,
  userId: {
    type: String,
    required: true,
  },
  products: [{
    productId: {
      type: Number
    },
    qty: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    discount: {
      voucherId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      },
      amount: {
        type: Number,
        default: 0
      }
    },
    _id: false
  }],
  status: {
    type: String,
    required: true,
  },
  isPay: { type: Boolean, require: true, default: false },
  subTotal: {
    type: Number,
    required: true,
    default: 0
  },
  shiping: {
    type: Number,
    default: 0
  },
  shipingDiscount: {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  discount: {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  total: {
    type: Number,
    default: 0
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
  note: {
    type: String,
    default: ""
  }
}, {
  collection: "Order",
  timestamps: true,
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true }
});
orderSchema.virtual('Product', {
  ref: 'ProductStandard',
  localField: 'products.productId',
  foreignField: 'id'
}, { toJSON: { virtuals: true } });
module.exports = mongoose.model("Order", orderSchema);