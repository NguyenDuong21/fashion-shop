const express = require("express");
const Router = express.Router();
const HomeController = require("../controllers/home");
const AdminController = require("../controllers/adminController");
const AccountController = require("../controllers/AcountController");
const OrderController = require("../controllers/orderController");
const PaymentController = require("../controllers/PaymentController");
const BlogController = require("../controllers/BlogController");
const CartController = require("../controllers/cartController");
const VoucherController = require("../controllers/VoucherController");
const { checkUserLogin } = require("../middleware/checkUserLogin");
const { verifyAccessToken, addUserToRequest} = require('../services/JwtService');
const { setIdDevice } = require('../helper/Convert');
const { paramMiddleware } = require('../helper/Convert');
Router.get("/", HomeController.homePage);
Router.all("/detail/:url_path", setIdDevice, addUserToRequest, HomeController.detailPage);
// checkUserLogin,
Router.get("/profile", verifyAccessToken,AccountController.profilePage);
Router.get("/cart", CartController.cartPage);
Router.get("/handelGoogleRedirectLogin", AccountController.handelGoogleRedirectLogin);
Router.get("/handelFacebookRedirectLogin", AccountController.handelFacebookRedirectLogin);
Router.get("/checkout/:id", verifyAccessToken, CartController.checkOutPage);
Router.get("/login", AccountController.loginPage);
Router.get("/logout", AccountController.logOut);
Router.get("/register", AccountController.registerPage);
Router.get("/blogs", BlogController.blogsPage);
Router.get("/list-voucher", paramMiddleware("/list-voucher"), verifyAccessToken, VoucherController.clientVoucherPage);
Router.get("/searchProduct", HomeController.searchProduct);
Router.get("/testSocket", HomeController.testSocket);
Router.get("/load_images", AdminController.load_images);
Router.get("/blog-detail/:id", BlogController.blogDetailPage);
Router.get("/register", AccountController.registerPage);
Router.get("/vnpay-redirect/:orderId", verifyAccessToken, PaymentController.VnPayHandel);
Router.get("/momo-redirect/:orderId", verifyAccessToken, PaymentController.MomoHandel);
// Router.post("/reviewProduct", verifyAccessToken,AccountController.reviewProduct);
Router.post("/loadDetailOrder", verifyAccessToken,AccountController.loadDetailOrder);
Router.post("/checkout-paypal", verifyAccessToken, PaymentController.checkoutPaypal);
Router.post('/saveVoucher', verifyAccessToken, VoucherController.saveVoucher);
Router.post('/saveInfoOrder', verifyAccessToken, OrderController.saveInfoOrder);
Router.post('/register', AccountController.registerAndSendOtp)
Router.post('/validate-otp', AccountController.validateOtp)
Router.post('/get-otp', AccountController.responseOtp)
Router.post("/get-model", HomeController.getModelProduct)
Router.post("/delete_image", AdminController.delete_image);
Router.post("/create-order", OrderController.createOrder);
Router.post("/login", AccountController.loginAccount);
Router.post("/create_payment_url", PaymentController.vnpPayment);
Router.post("/create_payment_MoMo", PaymentController.momoPayment);
Router.post("/dat-hang", OrderController.datHang);
Router.get("/cat/:cat_path", HomeController.categoryPage);
module.exports = Router;