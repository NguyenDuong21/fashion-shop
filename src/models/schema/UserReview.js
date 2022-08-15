const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserReviewSchema = new Schema({
    productId: Number,
    userId: String,
    content: String,
    rating: Number
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
  });
  UserReviewSchema.virtual('UserReview', {
    ref: 'Users',
    localField: 'userId',
    foreignField: '_id'
  }, { toJSON: { virtuals: true } });
module.exports = mongoose.model("UserReviewSchema", UserReviewSchema, "UserReview");