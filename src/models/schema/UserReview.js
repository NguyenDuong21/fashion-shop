const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserReviewSchema = new Schema({
    productId: Number,
    userId: Number,
    content: String,
    rating: Number
}, {timestamps: true});

module.exports = mongoose.model("UserReviewSchema", UserReviewSchema, "UserReview");