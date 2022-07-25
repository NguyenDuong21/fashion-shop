const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CategorySchema = new Schema({
    catid: Number,
    parent_catid: {
        type: Number,
        default : 0
    },
    name: String,
    display_name: String,
    url_path: String,
    image: String,
    level: Number,
    children: [{
        type: Number,
        ref: "Category",
        default: null
    } ]
}, {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
  });
CategorySchema.virtual('ListCat', {
    ref: 'Category',
    localField: 'children',
    foreignField: 'catid'
  }, { toJSON: { virtuals: true } });
module.exports = {
    CategorySchema: mongoose.model('Category', CategorySchema,"Category")
}