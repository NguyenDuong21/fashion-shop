const express = require("express");
const Router = express.Router();
const HomeController = require("../controllers/home");
const AdminController = require("../controllers/adminController");
const AccountController = require("../controllers/AcountController");
const OrderController = require("../controllers/orderController");
const PaymentController = require("../controllers/PaymentController");
const BlogController = require("../controllers/BlogController");
const CartController = require("../controllers/CartController");
const VoucherController = require("../controllers/VoucherController");
const { checkUserLogin } = require("../middleware/checkUserLogin");
Router.get("/", HomeController.homePage);
Router.get("/detail/:url_path", HomeController.detailPage);
// checkUserLogin,
Router.get("/cart", CartController.cartPage);
Router.get("/login", AccountController.loginPage);
Router.get("/register", AccountController.registerPage);
Router.get("/blogs", BlogController.blogsPage);
Router.get("/list-voucher", VoucherController.clientVoucherPage);
Router.get("/searchProduct", HomeController.searchProduct);
Router.get("/testSocket", HomeController.testSocket);
Router.get("/load_images", AdminController.load_images);
Router.get("/blog-detail/:id", BlogController.blogDetailPage);
Router.get("/checkout/:id", OrderController.checkoutPage);
Router.get("/register", AccountController.registerPage);
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
Router.post("/checkout-paypal", OrderController.checkoutPaypal);
Router.get("/vnpay-redirect/:orderId", OrderController.VnPayHandel);
Router.get("/momo-redirect/:orderId", OrderController.MomoHandel);
Router.get("/cat/:cat_path", HomeController.categoryPage);
module.exports = Router;