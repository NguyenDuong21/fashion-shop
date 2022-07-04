const express = require("express");
const Router = express.Router();
const cartController = require("../controllers/cartController");
Router.post("/add-cart", cartController.addToCart);
Router.get("/get-all", cartController.getCart);
module.exports = Router;
