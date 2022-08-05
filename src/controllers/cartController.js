const productModal = require("../models/product");
const Cart = require("../models/schema/cart");
const { ProductSchema } = require("../models/schema/products");
const { numberToMoney, addCommaMoney } = require('../helper/Convert');
const { client, addProduct, minusProduct, getAllCart, setAllCart, delAllCart, delProduct } = require("../services/RedisService");
const { ProductStandardSchema } = require("../models/schema/product_standard");
const { InventorySchema } = require("../models/schema/inventory");
const VoucherSchema = require("../models/schema/Voucher");
const UserVoucherSchema = require("../models/schema/UserVoucher");
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
    const currentDate = new Date();
    const { userId } = req.payload;
    let listVoucherOfUser = await UserVoucherSchema.findOne({ userId, }, { _id: 0, "voucher": 1 }).populate({
      path: 'voucher.id',
      match: { Status: true, startDate: { $lte: currentDate }, expireDate: { $gt: currentDate } },
      model: "Voucher",
      populate: {
        path: 'VoucherProduct',
        model: "ProductStandard"
      }
    });
    let objVoucherRender = {
      '62d787812c06f2cebf59eb38': [],
      '62d787db2c06f2cebf59eb39': [],
      '62d7882c2c06f2cebf59eb3a': []
    }
    let objTitle = {
      '62d787812c06f2cebf59eb38': "Mã miễn phí vận chuyển",
      '62d787db2c06f2cebf59eb39': "Giảm trên tổng hóa đơn",
      '62d7882c2c06f2cebf59eb3a': "Giảm giá cho sản phẩm"
    }
    listVoucherOfUser.voucher.forEach(function(el) {
      if (el.id && el.status) {
        objVoucherRender[el.id.type].push(el.id);
      }
    });
    let VoucherProductAvailability = {};
    let arrIdProductOrder = [];
    let curentOrder = await Order.findOne({ _id: orderId }).populate('Product');
    let objIdProductOrder = await Order.findOne({ _id: orderId }, { "products.productId": 1, _id: 0 });

    objIdProductOrder.products.forEach(function(e) {
      arrIdProductOrder.push(e.productId);
    });
    objVoucherRender['62d7882c2c06f2cebf59eb3a'].forEach(function(el) {
      if (el.unit == "VNĐ") {
        VoucherProductAvailability[el._id] = el.VoucherProduct.filter(value => arrIdProductOrder.includes(value.id) && value.price > el.discount);
      } else {
        VoucherProductAvailability[el._id] = el.productId.filter(value => arrIdProductOrder.includes(value));
      }
    });
    let objCheckVoucherUsed = {};
    if (curentOrder.discount.voucherId) {
      objCheckVoucherUsed[curentOrder.discount.voucherId] = 1;
    }
    if (curentOrder.shipingDiscount.voucherId) {
      objCheckVoucherUsed[curentOrder.shipingDiscount.voucherId] = 1;
    }
    curentOrder.products.forEach(function(el) {
      if (el.discount.voucherId) {
        objCheckVoucherUsed[el.discount.voucherId] = 1;
      }
    });
    return res.render("xe-mart/checkout", { curentOrder, numberToMoney, objVoucherRender, objTitle, addCommaMoney, VoucherProductAvailability, objCheckVoucherUsed });
  } catch (error) {
    next(error);
  }

}
module.exports = { getAllProduct, addToCart, getCart, cartPage, delCart, checkOutPage };