import express from "express";
let router = express.Router();
import HomeController from "../controllers/HomeController";
const { homePage } = require("../controllers/home");
let initWebRoutes = (app) => {
  router.get("/", homePage);
  router.get("/reserve-table/:senderId", HomeController.reserveTable);
  router.post("/setup-profile", HomeController.setupProfile);
  router.post("/setup-persistent-menu", HomeController.setupPersistentMenu);
  router.post("/reserve-table-ajax", HomeController.handelPostReserveTable);
  app.post("/webhook", HomeController.postWebhook);
  app.get("/webhook", HomeController.getWebhook);
  return app.use("/", router);
};

module.exports = initWebRoutes;
