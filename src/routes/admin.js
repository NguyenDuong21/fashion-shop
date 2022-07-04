const express = require("express");
const Router = express.Router();
const AdminController = require("../controllers/adminController");
const update = require("../helper/upload");

Router.get("/", AdminController.indexPage);
Router.get("/write-post", AdminController.writePostPage);
Router.post("/uploadfile", update.single("img"), AdminController.postPost);
module.exports = Router;
