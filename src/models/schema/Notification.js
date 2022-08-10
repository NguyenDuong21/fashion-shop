const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const NotificationSchema = new Schema({
    redirectUrl: String,
    type: String,
    image: String,
    message: String,
    isReaded: Boolean
},{timestamps: true})
module.exports = mongoose.model("NotificationSchema", NotificationSchema, "Notification");