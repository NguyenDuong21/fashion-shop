const express = require("express");
const productRouter = express.Router();
const CartController = require("../controllers/cartController");
productRouter.get("/", CartController.getAllProduct);

module.exports = productRouter;
