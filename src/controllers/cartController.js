const productModal = require("../models/product");
const Cart = require("../models/schema/cart");
const { ProductSchema } = require("../models/schema/products");
const { numberToMoney } = require("../helper/Convert");
const { client, addProduct, minusProduct, getAllCart, setAllCart, delAllCart, delProduct } = require("../services/RedisService");
const { ProductStandardSchema } = require("../models/schema/product_standard");
const { InventorySchema } = require("../models/schema/inventory");
const Order = require("../models/schema/order");

const cartPage = async(req, res, next) => {
  const userId = req.signedCookies.uid;
  try {
    const allCart = await getAllCart(userId);
    const productIds = Object.keys(allCart);
    const product = await ProductStandardSchema.find({ id: { $in: productIds } }, { name: 1, img: 1, price: 1, id: 1, _id: 0 });
    return res.render("xe-mart/cart", { product, allCart, numberToMoney });
  } catch (error) {
    next(error)
  }

};
const getAllProduct = async(req, res) => {
  const products = await productModal.getProduct();
  res.json(products);
};
const getCart = async(req, res) => {
  const userId = req.signedCookies.uid;
  try {
    const allCart = await getAllCart(userId);
    const productIds = Object.keys(allCart);
    const product = await ProductStandardSchema.find({ id: { $in: productIds } }, { name: 1, img: 1, price: 1, id: 1, _id: 0 });
    return res.json({
      code: 200,
      message: { product, allCart }
    })
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }

};
const addToCart = async(req, res) => {
  const { productId, quantity } = req.body;
  let userId = req.signedCookies.uid;
  let payload = req.payload;
  try {
    const addToCart = await addProduct(userId, productId, quantity);
    if (addToCart && userId && payload) {
      const stockPromise = InventorySchema.findOneAndUpdate({
        productId,
        quantity: { $gt: quantity }
      }, {
        $inc: {
          quantity: -quantity
        },
        $push: {
          reservation: {
            userId,
            quantity
          }
        }
      })
      res.json({ code: 200, message: 'success' });
      await stockPromise;
      return;
    }
    res.json({ code: 200, message: 'success' });
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }
};
const delCart = async(req, res, next) => {
  const { idProduct } = req.body;
  let userId = req.signedCookies.uid;
  try {
    const deleted = await delProduct(userId, idProduct);
    return res.json({ code: 200, message: 'success' });
  } catch (error) {
    next(error);
  }
}
const checkOutPage = async(req, res, next) => {
  try {
    let orderId = req.params.id;
    let curentOrder = await Order.findOne({ _id: orderId }).populate('Product');
    return res.render("xe-mart/checkout", { curentOrder, numberToMoney });
  } catch (error) {
    next(error);
  }

}
module.exports = { getAllProduct, addToCart, getCart, cartPage, delCart, checkOutPage };