const productModal = require("../models/product");
const Cart = require("../models/schema/cart");
const { ProductSchema } = require("../models/schema/products");
const { numberToMoney } = require("../helper/Convert");
const client = require("../services/RedisService");

// client.on("error", (err) => console.log("Redis Client Error", err));

// (async function () {
//   await client.connect();
// })();

const getAllProduct = async (req, res) => {
  const products = await productModal.getProduct();
  res.json(products);
};
const getCart = async (req, res) => {
  if (req.session && req.session.user) {
    let cart = await client.get(req.session.user._id);
    if (!cart && !req.session.cart) return res.json({ message: "cartEmpty" });
    if (cart) {
      cart = JSON.parse(cart);
      console.log(cart);
    } else if (req.session.cart) {
      cart = req.session.cart;
    }
    cart = new Cart(cart);
    cart = await cart.populate({
      path: "items.productId",
      select: ["name", "price"],
    });
    res.json({ message: "success", cart: cart });
  } else {
    res.json({ message: "No authentication" });
  }
};
const addToCart = async (req, res) => {
  const productId = req.body.id;
  try {
    if (req.session.user) {
      // let cart = await Cart.findOne({ user: req.session.user._id });
      let cart = await client.get(req.session.user._id);
      cart = JSON.parse(cart);

      if (!cart && req.session.cart) {
        cart = req.session.cart;
        cart = new Cart(cart);
      } else if (cart) {
        cart = new Cart(cart);
      } else {
        cart = new Cart({ totalQty: 0 });
      }
      const product = await ProductSchema.findById(productId);
      if (product) {
        const index = cart.items.findIndex((p) => {
          return p.productId == productId;
        });
        if (index > -1) {
          cart.items[index].qty++;
          cart.items[index].price = cart.items[index].qty * product.price;
          cart.totalQty++;
          cart.totalCost += +product.price;
        } else {
          cart.items.push({
            productId: product._id,
            qty: 1,
            price: product.price,
            title: product.short_description,
            productCode: product.id,
            img: product.image,
          });
          cart.totalQty++;
          cart.totalCost += +product.price;
        }
        cart.user = req.session.user._id;
        req.session.cart = cart;
        client.set(req.session.user._id, JSON.stringify(cart));
        return res.json({
          message: "success",
          productAdd: product,
          totalPrice: numberToMoney(cart.totalCost),
          numItem: cart.totalQty,
          numItemDistince: cart.items.length,
        });
      } else {
        return res.json({ message: "product not found" });
      }
    } else {
      return res.json({ message: "please login" });
    }
  } catch (error) {
    return res.json({ message: error.message });
  }
};
module.exports = { getAllProduct, addToCart, getCart };
