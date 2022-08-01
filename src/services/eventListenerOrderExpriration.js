const { client } = require('../services/RedisService');
const { sendMail } = require('../helper/SendEmail');
const express = require('express');
const app = express();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB_URI);
const Order = require("../models/schema/order");
client.psubscribe("__keyevent@0__:expired");
client.on("pmessage", async(pattern, channel, message) => {
  const [key, userId, orderId, date] = message.split('::');
  if (key === 'orderId') {
    // let content = `
    //   <b>Xin chào ${userId}</b> <br />
    //   Bạn có một đơn hàng mã ${orderId} chưa thanh toán.
    //   Hãy kiểm tra và thanh toán ngay nào: <a href='http://localhost:8080/checkout/${orderId}'>Xen ngay</a> <br />
    //   <b color:'red'>Chú ý: </b> Đơn hàng sẽ tự động hủy vào lúc ${date}
    // `
    // await sendMail(userId, content, 'Thông báo đơn hàng chưa thanh toán');
  } else if (key === 'cancelOrder') {
    console.log("Tự động hủy đơn" + userId);
    await Order.findOneAndUpdate({ _id: userId }, { status: 'dahuy' });
  }
});
app.listen(8081, () => {
  console.log(`EventListener is running 8081`);
})