const Cart = require("../models/schema/cart");
const Order = require("../models/schema/order");
const Detail = require("../models/schema/detailorder");
const Transaction = require("../models/schema/transaction");
const { client, getAllCart, delAllCart } = require("../services/RedisService");
const { CounterSchema } = require("../models/schema/counter");
const { numberToMoney, convertVNDtoUSD, formatDate, cancelOrder } = require("../helper/Convert");
const { ProductStandardSchema } = require('../models/schema/product_standard');
const createOrderXemart = async(req, res, next) => {
  try {
    const { seq } = await CounterSchema.increment('noteId');
    const userId = req.signedCookies.uid;
    const allCart = await getAllCart(userId);
    const productIds = Object.keys(allCart);
    let product = await ProductStandardSchema.find({ id: { $in: productIds } }, { price: 1, id: 1, _id: 0 });
    let products = [];
    for (let i = 0; i < product.length; i++) {
      let obj = {};
      obj['productId'] = product[i].id;
      obj['price'] = product[i].price;
      obj['qty'] = allCart[product[i].id];
      products.push(obj);
    }
    let order = await Order.create({ _id: seq, userId, products, status: 'khoitao' });
    await cancelOrder("thien123111555@gmail.com", [104303301, 104303300]);
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
const checkoutPage = async(req, res) => {
  const idOrder = req.params.id;
  const order = await Order.findById(idOrder);
  let detailOrder = await Detail.findOne({ orderId: idOrder });
  detailOrder = await detailOrder.populate({
    path: "items.productId",
    select: ["name"],
  });
  let total = await convertVNDtoUSD(order.total * 1);
  return res.render("checkout", {
    order,
    detailOrder,
    numberToMoney,
    total,
  });
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
const checkoutPaypal = async(req, res) => {
  const { code, mode, orderId, status, amount } = req.body;
  const updated = await Order.findByIdAndUpdate(orderId, {
    status: "danggiao",
    isPay: true,
  });
  if (updated) {
    const transaction = new Transaction({
      code,
      mode,
      orderId,
      status,
      amount,
    });
    const transactionSaved = await transaction.save();
    if (transactionSaved) {
      res.json("success");
    }
  }
};
const VnPayHandel = async(req, res) => {
  const orderId = req.params.orderId;
  const amount = req.query.vnp_Amount;
  const code = req.query.vnp_TransactionNo;
  const status = "success";
  const mode = "VNPAY";
  const updated = await Order.findByIdAndUpdate(orderId, {
    status: "danggiao",
    isPay: true,
  });
  if (updated) {
    const transaction = new Transaction({
      code,
      mode,
      orderId,
      status,
      amount,
    });
    const transactionSaved = await transaction.save();
    if (transactionSaved) {
      res.redirect("/checkout/" + orderId);
    }
  }
};
const MomoHandel = async(req, res) => {
  const orderId = req.params.orderId;
  const amount = req.query.amount;
  const code = req.query.transId;
  const status = "success";
  const mode = "MOMO";
  const updated = await Order.findByIdAndUpdate(orderId, {
    status: "danggiao",
    isPay: true,
  });
  if (updated) {
    const transaction = new Transaction({
      code,
      mode,
      orderId,
      status,
      amount,
    });
    const transactionSaved = await transaction.save();
    if (transactionSaved) {
      res.redirect("/checkout/" + orderId);
    }
  }
};
module.exports = {
  createOrder,
  checkoutPage,
  datHang,
  checkoutPaypal,
  VnPayHandel,
  MomoHandel,
  createOrderXemart
};