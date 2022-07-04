const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductSchema = new Schema({
    id: String,
    name: String,
    short_description: String,
    price: Schema.Types.Decimal128,
    description: String,
    brand:{
        id: String,
        name: String,
        slug: String
    },
    image: String,
    amount: Number
})
module.exports = {ProductSchema: mongoose.model('Products', ProductSchema)}