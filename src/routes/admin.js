const express = require("express");
const Router = express.Router();
const AdminController = require("../controllers/adminController");
const update = require("../helper/upload");

Router.get("/", AdminController.indexPage);
Router.get("/write-post", AdminController.writePostPage);
Router.get("/san-pham-kho", AdminController.listProductPage);
Router.get("/them-san-pham", AdminController.addProductPage);
Router.get("/them-ma-giam-gia", AdminController.addVoucherPage);
Router.get("/danh-sach-voucher", AdminController.listVoucherPage);
Router.get("/cap-nhap-thong-tin", AdminController.updateInfoPage);
Router.get("/search-product", AdminController.searchProduct)
Router.get("/ton-kho-thuc-te", AdminController.realTimeInVentory)
Router.get("/ds-phieu-nhap-hang", AdminController.listInboundOrder);
Router.get("/phieu-nhap-hang", AdminController.inboundOrder);
Router.post("/phieu-nhap-hang", AdminController.handelInboundProduct);
Router.get("/get-inbound-product", AdminController.getInboundProduct);
Router.get("/get-inbound-inventory-product", AdminController.getInboundAndInventoryProduct);
Router.get("/dieu-chinh-ton-kho", AdminController.adjustInventoryPage);
Router.get("/tao-dieu-chinh-ton-kho", AdminController.addAdjustInventory);
Router.post("/them-san-pham", AdminController.addProduct);
Router.post("/add-voucher", AdminController.addVoucher);
Router.post("/them-san-pham-gd1", AdminController.addProductStageOne);
Router.post("/them-san-pham-gd2", AdminController.addProductStageTow);
Router.post("/them-san-pham-gd3", AdminController.addProductStageThree);
Router.post("/add-classify", AdminController.add_classify);
Router.post("/add-model", AdminController.add_model);
Router.post("/update-img-product", update.any(), AdminController.uploadImgProduct);
Router.post("/ajax-get-cat", AdminController.ajaxgetcat);
Router.get("/danh-muc", AdminController.danhmucPage);
Router.post("/uploadfile", update.single("img"), AdminController.postPost);
Router.post("/danh-muc", AdminController.themDanhMuc);
module.exports = Router;