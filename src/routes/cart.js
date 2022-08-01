const express = require("express");
const Router = express.Router();
const CartController = require("../controllers/CartController");
const OrderController = require("../controllers/orderController");
const { verifyAccessToken, addUserToRequest } = require('../services/JwtService');
Router.post("/create-order", verifyAccessToken, OrderController.createOrderXemart);
Router.post("/add-product", addUserToRequest, CartController.addToCart);
Router.post("/get-all", CartController.getCart);
Router.post("/delete-cart", CartController.delCart);
module.exports = Router;