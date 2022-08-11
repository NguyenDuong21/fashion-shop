const { client } = require('../services/RedisService');
const { sendMail } = require('../helper/SendEmail');
const express = require('express');
const app = express();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB_URI);
const Order = require("../models/schema/order");
const { ProductStandardSchema } = require('../models/schema/product_standard');
require("dotenv").config();
client.psubscribe("__keyevent@0__:expired");
client.on("pmessage", async(pattern, channel, message) => {
  const [key, userId, orderId, date] = message.split('::');
  if (key === 'orderId') {
    console.log('Send Mail ');
    let content = `
      <b>Xin chào ${userId}</b> <br />
      Bạn có một đơn hàng mã ${orderId} chưa thanh toán.
      Hãy kiểm tra và thanh toán ngay nào: <a href='${process.env.HOSTNAME_WEBSITE}/checkout/${orderId}'>Xem ngay</a> <br />
      <b color:'red'>Chú ý: </b> Đơn hàng sẽ tự động hủy vào lúc ${date}
    `;
    // await sendMail(userId, content, 'Thông báo đơn hàng chưa thanh toán');
  } else if (key === 'cancelOrder') {
    console.log("Tự động hủy đơn" + userId);
    // await Order.findOneAndUpdate({ _id: userId }, { status: 'dahuy' });
  } else if(key == "notifyReview") {
    console.log("Thông báo đánh giá sản phẩm");
    let curOrder = await Order.findOne({_id: userId}).populate({
      path: "Product",
      select:"name parent",
      populate: {
        path: "Parent",
        select:"url_path"
      }
    });
    

    let content = `
          <b>Xin chào ${userId}</b> <br />
          Cảm ơn bạn đã mua hàng và sử dụng dịch vụ của shop. <br />
          Hãy để lại lời đánh giá cho các sản phẩm để shop cải thiện dịch vụ và đem lại trải nghiệm tốt hơn cho bạn nhé.
          Danh sách mặt hàng đã mua: <br />
        `;
    curOrder.Product.forEach(function(el){
      content+= `+ <a href='${process.env.HOSTNAME_WEBSITE_LOCAL}/detail/${el.Parent[0].url_path}'>${el.name}</a> <br />`
    });
    console.log(content);
    // await sendMail("thien123111555@gmail.com", content, 'Cảm ơn khách hàng đã ủng hộ! Hãy đánh giá chất lượng để chúng tôi cải thiện dịch vụ');
  }
});
app.listen(8081, () => {
  console.log(`EventListener is running 8081`);
})