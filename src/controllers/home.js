require("dotenv").config();
const { ProductSchema } = require("../models/schema/products");
const { numberToMoney } = require("../helper/Convert");
const { ProductStandardSchema } = require("../models/schema/product_standard");
const { InventorySchema } = require("../models/schema/inventory");
const { CategorySchema } = require("../models/schema/category");
const moment = require('moment');
const UserReviewSchema = require("../models/schema/UserReview")
const ProductRatingDetailSchema = require("../models/schema/ProductRatingDetail")
const order = require("../models/schema/order");
const UserReview = require("../models/schema/UserReview");

const searchProduct = async (req, res, next) => {
  const valSearch = req.query.searchField;
  try {
    const product = await ProductStandardSchema.find({
      name: { $regex: valSearch, $options: "i" },
      parent: 0
    }, { "name": 1, "img": 1, "url_path": 1 });
    return res.json({
      code: 200,
      product,
    });
  } catch (error) {
    return res.json({ code: 500, message: error.message })
  }

};


const homePage = async (req, res) => {
  const message = "Message";
  let notifyObject = {};
  notifyObject['image'] = "http://res.cloudinary.com/dtjkg9nih/image/upload/v1659084890/Products/nyolsyxd5aswm50jgob1.png";
  notifyObject['redirectUrl'] = "123";
  notifyObject['message'] = `Một đơn hàng vừa được đặt bởi Nguyễn Xuân Dương.`;
  notifyObject['isReaded'] = false;
  notifyObject['createdAt'] = new Date();
  // _io.emit("New Order", notifyObject);
  const productHomePage = await ProductStandardSchema.find({ parent: 0 });
  return res.render("xe-mart/index", {
    layout: false,
    productHomePage
  });
};

const detailPage = async (req, res) => {
  let UserReviewPromise;
  let ProductRatingDetailPromise;

  if (req.method == "POST") {
    const { productId, content, rating } = req.body;
    let key = `ratings.${rating}`
    const userId = req.playload?.userId;
    UserReviewPromise = await UserReviewSchema.findOneAndUpdate({ productId, userId }, { content, rating }, { upsert: true });
    const checkProduct = await ProductRatingDetailSchema.findOne({ productId });
    if (!checkProduct) {
      ProductRatingDetailPromise = await ProductRatingDetailSchema.create({ productId });
    }
    ProductRatingDetailPromise = await ProductRatingDetailSchema.findOneAndUpdate({ productId }, { $inc: { [key]: 1 } }, { new: true });
  } 
    const productID = req.query.spid;
    const userId = req.playload?.userId;
    let allOrderOfUser = false;
    let isContain;
    const allReview = await UserReview.find({productId:productID}).populate("UserReview");
    console.log(allReview);
    const products = await ProductStandardSchema.findOne({ id: productID });
    let listFilter = [...products.child, products.id];
    if (!userId) {
      req.session.redirect = req.protocol + '://' + req.get('host') + req.originalUrl;
    } else {
      allOrderOfUser = await order.find({ userId, "products.productId": { "$in": listFilter } }, { "products.productId": 1 });
    }
    if (allOrderOfUser) {
      isContain = true;
    }
  res.render("xe-mart/detail", { products, numberToMoney, userId, isContain, productID, allReview, moment });
  // if (req.query.isAjax) {
  //   res.json(product);
  // } else {
  //   res.render("detail", { product });
  // }
};


const testSocket = async (req, res) => {
  return res.sendFile(__basedir + "/views/testsocket.html");
};
const getModelProduct = async (req, res) => {
  let { spid, arrCondition } = req.body;
  let product = await ProductStandardSchema.findOne({ id: spid });

  for (let i = 0; i < product.models.length; i++) {
    if (product.models[i].name === arrCondition.join() || product.models[i].name === arrCondition.reverse().join()) {
      const _id = product.models[i]._id;
      const productModel = await ProductStandardSchema.findChildModel(_id);
      const inventory = await InventorySchema.findOne({ productId: productModel.id });
      return res.json({ message: 'success', model: { price: productModel.price, normal_stock: inventory.quantity, id: productModel.id } });
    }
  }
  return res.json({ message: "error" })
}
const categoryPage = async (req, res, next) => {
  let catPath = req.params.cat_path;
  let arr_CatId = catPath.split('.');
  let parent_catid = '';
  if (arr_CatId.length == 3) {
    parent_catid = arr_CatId.at(-2);
  } else {
    parent_catid = arr_CatId.at(-1);
  }
  let activeCat = arr_CatId.at(-1);
  try {
    const childCat = await CategorySchema.findOne({ level: 1, catid: parent_catid }).populate('ListCat');
    res.render('xe-mart/category', { childCat, activeCat });
  } catch (error) {
    next(error);
  }
}
const reviewAdminPage = async (req, res, next) => {
  const allProductRating = await ProductRatingDetailSchema.find({}).populate('Product', 'id name img');
  return res.render("admin/review-page", { layout: "./layouts/adminlayout",allProductRating })
};

module.exports = {
  homePage,
  detailPage,
  searchProduct,
  testSocket,
  getModelProduct,
  categoryPage,
  reviewAdminPage
};