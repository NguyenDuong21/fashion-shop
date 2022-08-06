const Cart = require("../models/schema/cart");
const Order = require("../models/schema/order");
const Detail = require("../models/schema/detailorder");
const VoucherSchema = require("../models/schema/Voucher");
const { client, getAllCart, delAllCart } = require("../services/RedisService");
const { CounterSchema } = require("../models/schema/counter");
const { numberToMoney, convertVNDtoUSD, formatDate, cancelOrder, caculatorTotalOrder } = require("../helper/Convert");
const { ProductStandardSchema } = require('../models/schema/product_standard');
const createOrderXemart = async(req, res, next) => {
  try {
    const { seq } = await CounterSchema.increment('noteId');
    const userId = req.signedCookies.uid;
    const allCart = await getAllCart(userId);
    const productIds = Object.keys(allCart);
    let product = await ProductStandardSchema.find({ id: { $in: productIds } }, { price: 1, id: 1, _id: 0 });
    let products = [];
    let subTotal = 0;
    let shiping = 20000;
    for (let i = 0; i < product.length; i++) {
      let obj = {};
      obj['productId'] = product[i].id;
      obj['price'] = product[i].price;
      obj['qty'] = allCart[product[i].id];
      subTotal += product[i].price * allCart[product[i].id];
      products.push(obj);
    }
    let order = await Order.create({ _id: seq, userId, products, status: 'khoitao', shiping, subTotal, total: subTotal + shiping });
    if (order) {
      const delAllCartPromiss = delAllCart(userId);
      let curentDate = new Date();
      const NUM_SECOND_NOTIFY = process.env.NUM_SECOND_NOTIFY * 1;
      const NUM_SECOND_CANCEL_ORDER = process.env.NUM_SECOND_CANCEL_ORDER * 1;
      curentDate.setMonth(curentDate.getMonth() + NUM_SECOND_NOTIFY + NUM_SECOND_CANCEL_ORDER);
      const setOrder = client.set(`orderId::${userId}::${order._id}::${formatDate(curentDate)}`, order._id, "EX", NUM_SECOND_NOTIFY);
      const cancelOrder = client.set(`cancelOrder::${order._id}`, order._id, "EX", NUM_SECOND_CANCEL_ORDER);
      res.redirect(`/checkout/${order._id}`);
      await setOrder;
      await cancelOrder;
      await delAllCartPromiss;
    }
    return;
  } catch (error) {
    console.log(error.message);
    next(error);
  }

};
const createOrder = async(req, res) => {
  if (req.session.user) {
    let cart = await client.get(req.session.user._id);
    cart = JSON.parse(cart);
    cart = new Cart(cart);
    let itemDetail = cart.items.map((el) => {
      return {
        productId: el.productId,
        qty: el.qty,
        price: el.price,
        img: el.img,
      };
    });
    const order = new Order({
      userId: req.session.user._id,
      status: "khoitao",
      subTotal: cart.totalCost,
      total: cart.totalCost,
    });
    try {
      const orderSaved = await order.save();
      const detailOrder = await Detail({
        orderId: orderSaved._id,
        items: itemDetail,
      });
      const detailOrderSaved = await detailOrder.save();
      if (detailOrderSaved) {
        await client.del(req.session.user._id);
        res.redirect("checkout/" + orderSaved._id);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.json({ message: "please login" });
  }
};

const datHang = async(req, res) => {
  const { name, address, phone, email } = req.body;
  const id = req.body.dathang;
  try {
    const updateObj = { name, address, phone, email, status: "dathang" };
    const updateOrder = await Order.findByIdAndUpdate(id, updateObj);

    return res.redirect("checkout/" + id);
  } catch (error) {
    console.log(error);
  }
};

const getAndUpdateCompTotal = async(req, res, next) => {
  let { orderId } = req.body;
  let updateComTotal = await caculatorTotalOrder({ _id: orderId });
  let updated = await Order.findOneAndUpdate({ _id: orderId }, updateComTotal);
  if (updated) {
    return res.json({ code: 200, updateComTotal });
  }
  return res.json({ code: 500 });
}
const applyVoucher = async(req, res, next) => {
  const { voucherId, orderId } = req.body;
  try {
    const currentDate = new Date();
    const voucherApply = await VoucherSchema.findOne({ _id: voucherId, Status: true, startDate: { $lte: currentDate }, expireDate: { $gt: currentDate } });
    if (!voucherApply) {
      return res.json({ code: 500, message: "Voucher không khả dụng." });
    }
    let orderUpdate = [];
    const orderApply = await Order.findOne({ _id: orderId });

    let priceCondition = voucherApply.from;
    const typeVoucher = voucherApply.type.toString();
    switch (typeVoucher) {
      case '62d787812c06f2cebf59eb38': //miễn phí vận chuyển
        let amountDiscountShip = 0;
        if (voucherApply.unit === '%') {
          amountDiscountShip = (voucherApply.discount / 100) * orderApply.shiping;
          amountDiscountShip = (amountDiscountShip >= voucherApply.max && voucherApply.max != 0) ? voucherApply.max : amountDiscountShip;

        } else if (voucherApply.unit === 'VNĐ') {
          amountDiscountShip = voucherApply.discount;
        }
        let orderUpdatedShip = await Order.findOneAndUpdate({ _id: orderId, subTotal: { $gte: priceCondition }, isPay: false }, { shipingDiscount: { 'voucherId': voucherId, amount: amountDiscountShip } });
        if (orderUpdatedShip) {
          return res.json({ code: 200, message: { type: "shiping", amount: amountDiscountShip } });
        } else {
          return res.json({ code: 500, message: "Có lỗi xảy ra. Ko thể áp dụng" });
        }
        break;
      case '62d787db2c06f2cebf59eb39': // giảm tổng hóa đơn.
        let amountDiscountSubTotal = 0;
        if (voucherApply.unit === '%') {
          amountDiscountSubTotal = (voucherApply.discount / 100) * orderApply.subTotal;
          amountDiscountSubTotal = (amountDiscountSubTotal >= voucherApply.max && voucherApply.max != 0) ? voucherApply.max : amountDiscountSubTotal;
        } else if (voucherApply.unit === 'VNĐ') {
          amountDiscountSubTotal = voucherApply.discount;
        }
        let orderUpdateTotal = await Order.findOneAndUpdate({ _id: orderId, subTotal: { $gte: priceCondition }, isPay: false }, { discount: { voucherId: voucherId, amount: amountDiscountSubTotal } });
        if (orderUpdateTotal) {
          return res.json({ code: 200, message: { type: "total", amount: amountDiscountSubTotal } })
        } else {
          return res.json({ code: 500, message: "Có lỗi xảy ra. Ko thể áp dụng" });
        }
        break;
      case '62d7882c2c06f2cebf59eb3a': // Giảm giá cho sản phẩm
        let amountDiscountForProduct = 0;
        let arrProductDiscount = voucherApply.productId;
        let productInfo = await ProductStandardSchema.find({ id: { $in: arrProductDiscount } });
        let objUpdateIdAmount = {};
        if (voucherApply.unit === '%') {
          amountDiscountForProduct = (voucherApply.discount / 100);
          let arrorderUpdate = [];
          arrorderUpdate.push(Order.findOneAndUpdate({ _id: orderId, isPay: false }, { $set: { "products.$[].discount": { voucherId: null, amount: 0 } } }));
          for (let i = 0; i < productInfo.length; i++) {
            let totalProductDiscount = productInfo[i].price * amountDiscountForProduct;
            totalProductDiscount = (totalProductDiscount >= voucherApply.max && voucherApply.max != 0) ? voucherApply.max : totalProductDiscount;
            arrorderUpdate.push(Order.findOneAndUpdate({ _id: orderId, isPay: false, subTotal: { $gte: priceCondition }, "products.productId": productInfo[i].id }, { $set: { "products.$.discount": { voucherId: voucherId, amount: totalProductDiscount } } }));
            objUpdateIdAmount[productInfo[i].id] = productInfo[i].price - totalProductDiscount;
          }
          let updated = await Promise.all(arrorderUpdate);
          if (updated) {
            return res.json({ code: 200, message: { type: "forproduct", amount: objUpdateIdAmount } })
          } else {
            return res.json({ code: 500, message: "Có lỗi xảy ra. Ko thể áp dụng" });
          }
        } else if (voucherApply.unit === 'VNĐ') {
          amountDiscountForProduct = voucherApply.discount;
          await Order.findOneAndUpdate({ _id: orderId, isPay: false, }, { $set: { "products.$[].discount": { voucherId: null, amount: 0 } } });
          let orderUpdated = await Order.findOneAndUpdate({ _id: orderId, isPay: false, subTotal: { $gte: priceCondition }, "products.productId": { "$in": arrProductDiscount }, "products.price": { "$gt": amountDiscountForProduct } }, { $set: { "products.$.discount": { voucherId: voucherId, amount: amountDiscountForProduct } } });
          if (orderUpdated) {
            return res.json({ code: 200, message: { type: "forproductVNĐ", amount: amountDiscountForProduct, arrId: arrProductDiscount } });
          } else {
            return res.json({ code: 500, message: "Có lỗi xảy ra. Ko thể áp dụng" });
          }
        }
        break
      default:
        return res.json({ code: 500, message: "Có lỗi xảy ra. Ko thể áp dụng" });
        break;
    }

  } catch (error) {
    next(error);
  }
  return;
}
const unApplyVoucher = async(req, res, next) => {
  const { voucherId, orderId } = req.body;
  try {
    const currentDate = new Date();
    const voucherApply = await VoucherSchema.findOne({ _id: voucherId, Status: true, startDate: { $lte: currentDate }, expireDate: { $gt: currentDate } });
    if (!voucherApply) {
      return res.json({ code: 500, message: "Không tìm thấy Voucher" });
    }
    const typeVoucher = voucherApply.type.toString();
    switch (typeVoucher) {
      case '62d787812c06f2cebf59eb38': //miễn phí vận chuyển
        let orderUpdatedShip = await Order.findOneAndUpdate({ _id: orderId, isPay: false }, { shipingDiscount: { 'voucherId': null, amount: 0 } });
        if (orderUpdatedShip) {
          return res.json({ code: 200, message: { type: "shiping" } });
        } else {
          return res.json({ code: 500, message: "Có lỗi xảy ra." });
        }
        break;
      case '62d787db2c06f2cebf59eb39': // giảm tổng hóa đơn.
        let orderUpdatedTotal = await Order.findOneAndUpdate({ _id: orderId, isPay: false }, { discount: { 'voucherId': null, amount: 0 } });
        if (orderUpdatedTotal) {
          return res.json({ code: 200, message: { type: "total" } });
        } else {
          return res.json({ code: 500, message: "Có lỗi xảy ra." });
        }
        break;
      case '62d7882c2c06f2cebf59eb3a': // Giảm giá cho sản phẩm
        let arrProductDiscount = voucherApply.productId;
        let orderUpdatedProduct = await Order.findOneAndUpdate({ _id: orderId, isPay: false }, { $set: { "products.$[elem].discount": { voucherId: null, amount: 0 } } },
        {
          "arrayFilters": [
            {
              "elem.productId": {
                "$in": arrProductDiscount
              }
            }
          ]
        });
        if (orderUpdatedProduct) {
          return res.json({ code: 200, message: { type: "forproduct", arrId: arrProductDiscount } })
        } else {
          return res.json({ code: 500, message: "Có lỗi xảy ra." });
        }
        break
      default:
        return res.json({ code: 500, message: "Có lỗi xảy ra." });
        break;
    }

  } catch (error) {
    next(error);
  }
  return;
}
const saveInfoOrder = async(req, res, next) => {
  const { name, email, address, phone, note, orderId } = req.body;
  try {
    const updated = await Order.findOneAndUpdate({ _id: orderId }, { name, email, address, phone, note, status: 'nhapthongtin' }, { new: true });
    if (updated) {
      return res.json({ code: 200, message: "success" });
    }
  } catch (error) {
    return res.json({ code: 500, message: error.message });
  }
}
module.exports = {
  createOrder,
  datHang,
  createOrderXemart,
  applyVoucher,
  unApplyVoucher,
  getAndUpdateCompTotal,
  saveInfoOrder
};