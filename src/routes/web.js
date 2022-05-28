import express from "express";
let router = express.Router();
import HomeController from "../controllers/HomeController";
let initWebRoutes = (app) => {
    router.get('/', HomeController.getHomePage);
    router.get('/reserve-table', HomeController.reserveTable);
    router.post('/setup-profile', HomeController.setupProfile);
    router.post('/setup-persistent-menu', HomeController.setupPersistentMenu);
    router.post('/reserve-table-ajax', HomeController.handelPostReserveTable);
    app.post('/webhook', HomeController.postWebhook);
    app.get('/webhook', HomeController.getWebhook);
    return app.use('/', router);
}

module.exports = initWebRoutes;