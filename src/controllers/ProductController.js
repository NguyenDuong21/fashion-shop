const { ProductStandardSchema } = require('../models/schema/product_standard');
const { InventorySchema } = require('../models/schema/inventory');
const { numberToMoney, addCommaMoney } = require('../helper/Convert');
const { formatDate } = require('../helper/Convert');
const cloudinary = require('../helper/cloudinary');
const { slugify } = require('../helper/Convert');
const { CategorySchema } = require("../models/schema/category");
const { CounterSchema } = require("../models/schema/counter");
const fs = require('fs');
const listProductPage = async(req, res) => {
  try {
    const productAll = await ProductStandardSchema.find({ parent: 0 }).populate('ListChild');
    res.render('admin/list-product', { layout: "./layouts/adminlayout", productAll, formatDate, numberToMoney });
  } catch (error) {

  }
}
const updateInfoPage = async(req, res) => {
  const productAll = await ProductStandardSchema.find({ parent: 0 });
  res.render('admin/update-info', { layout: "./layouts/adminlayout", productAll, formatDate });
}
const addProductPage = async(req, res) => {
  const catLV1 = await CategorySchema.find({ level: 1 });
  res.render('admin/them-san-pham', { layout: "./layouts/adminlayout", catLV1 });
}
const addProduct = (req, res) => {
  let attr = req.body.attr;

  let nameclassify1 = req.body.Nameclassify1;
  let nameclassify2 = req.body.Nameclassify2;
  let valclassify1 = req.body.valclassify1;
  let valclassify2 = req.body.valclassify2;
  let price = req.body.price;
  let stock = req.body.stock;
  console.log(attr, nameclassify1, nameclassify2, valclassify1, valclassify2, price, stock);
  res.json({ attr, nameclassify1, nameclassify2, valclassify1, valclassify2, price, stock });
}
const addProductStageOne = async(req, res, next) => {
  const { nameProduct, catOne, catTow, action, productId } = req.body;
  let url_path = '';
  const Cat = await CategorySchema.find({ $or: [{ catid: catOne }, { catid: catTow }] }).sort({ level: 1 });
  let breadcrumbs = [{
      url: `/cat/${Cat[0].url_path}`,
      name: Cat[0].display_name,
      level: Cat[0].level,
      catid: Cat[0].catid
    },
    {
      url: `/cat/${Cat[1].url_path}`,
      name: Cat[1].display_name,
      level: Cat[1].level,
      catid: Cat[1].catid
    }
  ]
  try {
    if (action === 'insert') {
      let { seq } = await CounterSchema.increment('productId');
      url_path = `${slugify(nameProduct)}?spid=${seq}`;
      breadcrumbs.push({
        url: `${req.headers.host}/${url_path}`,
        name: nameProduct,
        lever: 3,
        catid: 0
      });
      const product = new ProductStandardSchema({ id: seq, name: nameProduct, breadcrumbs, url_path });
      const productInserted = await product.save();
      return res.json({ productId: productInserted._id });
    } else if (action === 'update') {
      const productUpdate = await ProductStandardSchema.findOneAndUpdate({ _id: productId }, { name: nameProduct }, { new: true });
      url_path = `${slugify(productUpdate.name)}?spid=${productUpdate.id}`;
      breadcrumbs.push({
        url: `${req.headers.host}/${url_path}`,
        name: nameProduct,
        lever: 3,
        catid: 0
      });
      const productUpdateBreadCrumbs = await ProductStandardSchema.findOneAndUpdate({ _id: productId }, { breadcrumbs, url_path }, { new: true });
      return res.json({ productId: productUpdateBreadCrumbs._id });
    }
  } catch (error) {
    next(error);
  }

}
const addProductStageTow = async(req, res, next) => {
  const { description, specs, productId } = req.body;
  const updated = await ProductStandardSchema.findOneAndUpdate({ _id: productId }, { description, specs });
  res.json(updated);
}
const addProductStageThree = async(req, res, next) => {
  const { singlePrice, singleStock, productId, rangerPrice } = req.body;
  console.log(singleStock);
  try {
    const productUpdated = await ProductStandardSchema.findOneAndUpdate({ _id: productId }, { price: singlePrice, discountRange: rangerPrice }, { new: true });
    const insertedInventory = await InventorySchema.create({ productId: productUpdated.id, quantity: singleStock });
    if (insertedInventory) {
      res.json({ message: "success" });
    }
  } catch (error) {
    next(error);
  }
}
const add_classify = async(req, res) => {
  const { productId, classifys } = req.body;
  const updated = await ProductStandardSchema.findOneAndUpdate({ _id: productId }, { classifys });
  return res.json(updated._id);
}
const add_model = async(req, res, next) => {
  const { productId, models } = req.body;
  let totalStock = 0;
  let objInforModel = {};
  let totalPrice = 0;
  models.forEach(function(el) {
    totalStock += el.normal_stock;
    totalPrice += el.price * 1;
    if (objInforModel[el.name] == undefined) {
      objInforModel[el.name] = {};
    }
    objInforModel[el.name]['normal_stock'] = el.normal_stock;
    objInforModel[el.name]['price'] = el.price;
  });
  let avgPrice = Math.ceil(totalPrice / models.length);
  const updated = await ProductStandardSchema.findOneAndUpdate({ _id: productId }, { models, totalStock, price: avgPrice }, { new: true });
  let arrInsertProduct = [];
  let arrInsertInventory = [];
  let arrPromise = [];
  let newproductId = [];
  for (let i = 0; i < updated.models.length; i++) {
    arrPromise.push(
      new Promise(resolve => {
        CounterSchema.increment('productId').then(seq => {
          let nameproduct = `${updated.name} (${updated.models[i].name})`;
          arrInsertProduct.push({
            id: seq.seq,
            name: nameproduct,
            parent: updated.id,
            modelID: updated.models[i]._id,
            models: [updated.models[i]],
            price: objInforModel[updated.models[i].name].price
          });
          arrInsertInventory.push({
            productId: seq.seq,
            quantity: objInforModel[updated.models[i].name].normal_stock
          })
          newproductId.push(seq.seq);
          resolve(1);
        });
      })
    )
  }
  Promise.all(arrPromise).then(async(result) => {
    try {
      const productModelInsert = await ProductStandardSchema.insertMany(arrInsertProduct);
      const inventoryInserted = await InventorySchema.insertMany(arrInsertInventory);
      const updatedChild = await ProductStandardSchema.findOneAndUpdate({ _id: productId }, { child: newproductId });
      return res.json(updated._id);

    } catch (error) {
      next(error);
    }
  })

}
const uploadImgProduct = async(req, res) => {
  const uploader = async(path) => await cloudinary.uploads(path, "Products");
  const productId = req.body.productDepentId;
  if (req.method === "POST") {
    const img = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      img.push(newPath);
      fs.unlink(path, err => {
        if (err) console.log(err);
      });
    }
    const updated = await ProductStandardSchema.findOneAndUpdate({ _id: productId }, { img });
    for (let i = 0; i < updated.child.length; i++) {
      let childId = updated.child[i];
      let imgOfChild = updated.img[Math.floor(Math.random() * items.updated.img)];
      let updatedChild = await ProductStandardSchema.findOneAndUpdate({ id: childId }, { img: [imgOfChild] });
    }
    return res.redirect('them-san-pham');
  }
}
module.exports = {
  addProductStageOne,
  addProductStageTow,
  addProductStageThree,
  add_classify,
  add_model,
  uploadImgProduct,
  addProductPage,
  addProduct,
  listProductPage,
  updateInfoPage,
}