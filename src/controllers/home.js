require("dotenv").config();
const { ProductSchema } = require("../models/schema/products");
const { numberToMoney } = require("../helper/Convert");
const { ProductStandardSchema } = require("../models/schema/product_standard");
const { InventorySchema } = require("../models/schema/inventory");
const { CategorySchema } = require("../models/schema/category");

const searchProduct = async(req, res) => {
  const valSearch = req.query.searchField;
  const product = await ProductSchema.find({
    name: { $regex: valSearch, $options: "i" },
  });
  res.json({
    message: "success",
    productSearch: product,
  });
};


const homePage = async(req, res) => {

  const userLogin = req.payload.userId;
  const productHomePage = await ProductStandardSchema.find({ parent: 0 });
  return res.render("xe-mart/index", {
    layout: false,
    productHomePage
  });
};

const detailPage = async(req, res) => {
  const productID = req.query.spid;
  const products = await ProductStandardSchema.findOne({ id: productID });
  res.render("xe-mart/detail", { products, numberToMoney });
  // if (req.query.isAjax) {
  //   res.json(product);
  // } else {
  //   res.render("detail", { product });
  // }
};


const testSocket = async(req, res) => {
  return res.sendFile(__basedir + "/views/testsocket.html");
};
const getModelProduct = async(req, res) => {
  let { spid, combineCondition } = req.body;
  let product = await ProductStandardSchema.findOne({ id: spid });

  for (let i = 0; i < product.models.length; i++) {
    if (product.models[i].name === combineCondition) {
      const _id = product.models[i]._id;
      const productModel = await ProductStandardSchema.findChildModel(_id);
      const inventory = await InventorySchema.findOne({ productId: productModel.id });
      return res.json({ message: 'success', model: { price: productModel.price, normal_stock: inventory.quantity } });
    }
  }
  return res.json({ message: "error" })
}
const categoryPage = async(req, res, next) => {
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
module.exports = {
  homePage,
  detailPage,
  searchProduct,
  testSocket,
  getModelProduct,
  categoryPage
};