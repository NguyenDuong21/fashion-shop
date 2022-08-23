const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AdjustPriceSchema = new Schema({
    idProduct: {
        required: true,
        type: Number
    },
    originPrice: {
        type: Number,
        required: true
    },
    adjustedPrice: {
        type: Number,
        required: true
    },
    personAdjust:{
        type:String,
        default: '0'
    }
}, { timestamps: true });
module.exports = mongoose.model("AdjustPrice", AdjustPriceSchema, "AdjustPrice");