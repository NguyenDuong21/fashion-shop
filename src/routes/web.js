import express from "express";
let router = express.Router();
import HomeController from "../controllers/HomeController";
let initWebRoutes = (app) => {
    router.get('/', HomeController.getHomePage);
    router.post('/setup-profile', HomeController.setupProfile);
    app.post('/webhook', HomeController.postWebhook);
    app.get('/webhook', HomeController.getWebhook);
    return app.use('/', router);
}

module.exports = initWebRoutes;