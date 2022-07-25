const PostModel = require("../models/posts");
const { ProductStandardSchema } = require('../models/schema/product_standard');
const { createCoupon } = require("../helper/Convert");
const moment = require("moment");
var FroalaEditor = require("wysiwyg-editor-node-sdk/lib/froalaEditor.js");
const { CategorySchema } = require("../models/schema/category");
const { slugify } = require('../helper/Convert');
const { CounterSchema } = require("../models/schema/counter");
const { InventorySchema } = require('../models/schema/inventory');
const TypeVoucher = require("../models/schema/TypeVoucher");
const VoucherSchema = require("../models/schema/Voucher");
const cloudinary = require('../helper/cloudinary');
const { numberToMoney, addCommaMoney } = require('../helper/Convert');
const { formatDate } = require('../helper/Convert');
const fs = require('fs');
const InboundInventory = require("../models/schema/InboundInventory");
const indexPage = (req, res) => {
  res.render("admin/index", { layout: "./layouts/adminlayout" });
};
const writePostPage = (req, res) => {
  res.render("admin/baiviet", { layout: "./layouts/adminlayout" });
};
const danhmucPage = async(req, res) => {
  const AllCate = await CategorySchema.find({ level: 1 }).populate('ListCat');
  res.render("admin/danh-muc", { layout: "./layouts/adminlayout", AllCate });
}
const load_images = (req, res) => {
  FroalaEditor.Image.list("/public/uploads/img/", function(err, data) {
    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    for (let i = 0; i < data.length; i++) {
      data[i].url = data[i].url.replace("/public", "");
      data[i].thumb = data[i].thumb.replace("/public", "");
    }
    return res.send(data);
  });
};
const delete_image = (req, res) => {
  FroalaEditor.Image.delete("/public" + req.body.src, function(err) {
    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    return res.end();
  });
};
const postPost = async(req, res) => {
  const { tieude, tomtat, noidung } = req.body;
  const ngayviet = Date.now();
  const img = "/uploads/img/" + req.file.filename;
  const post = await PostModel.addPost(tieude, ngayviet, noidung, tomtat, img);
  const isSuccess = await PostModel.addPostElastic(
    post._id,
    post.tieude,
    post.ngayviet,
    post.noidung,
    post.tomtat,
    post.img
  );

  if (isSuccess == 1) {
    res.redirect("write-post");
  } else {
    res.send("Có lỗi sảy ra xin thử lại");
  }
};


const themDanhMuc = async(req, res) => {
  const { parentId, catAddName } = req.body;
  const id = Math.floor(Math.random() * (99999999 - 10000000)) + 10000000;
  const Cat = new CategorySchema({ catid: id, parent_catid: parentId, name: catAddName, display_name: catAddName, url_path: catAddName.replace(/[\,\.]/g, '').replace(/ /g, '-') + `.${id}`, children: null, level: 2 });
  try {
    const inserted = await Cat.save();
    const updated = await CategorySchema.findOneAndUpdate({ catid: parentId }, { $push: { children: inserted.catid } }, { new: true });
    if (updated) {
      return res.json({ message: "success" });
    }
    return res.json({ message: "error" });
  } catch (error) {
    console.log(error);
    return res.json({ message: "error" });

  }
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
      url: `/danhmuc/${Cat[0].url_path}`,
      name: Cat[0].display_name,
      level: Cat[0].level,
      catid: Cat[0].catid
    },
    {
      url: `/danhmuc/${Cat[1].url_path}`,
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
const ajaxgetcat = async(req, res) => {
  const catParentId = req.body.catId;
  const childCat = await CategorySchema.find({ parent_catid: catParentId, level: 2 });
  res.json({ childCat });
}
const addVoucherPage = async(req, res) => {
  const voucherTypes = await TypeVoucher.find();
  return res.render("admin/them-voucher", { layout: "./layouts/adminlayout", voucherTypes });
}
const searchProduct = async(req, res) => {
  const valSearch = req.query.q;
  const product = await ProductStandardSchema.find({
    name: { $regex: valSearch, $options: "i" },
    parent: 0
  });
  res.json(product);
};
const addVoucher = async(req, res) => {
  let { typeVoucher, remain, limitApply, daterange, status, productId, appFrom, unit, discount, max } = req.body;
  if (productId === undefined) {
    productId = [];
  }
  let [startDate, expireDate] = daterange.split("-");
  startDate = startDate.trim();
  expireDate = expireDate.trim();
  startDate = moment(startDate, "DD/MM/YYYY").toDate();
  expireDate = moment(expireDate, "DD/MM/YYYY").toDate();
  const Voucher = new VoucherSchema({
    type: typeVoucher,
    productId: productId,
    amount: remain,
    limit: limitApply,
    from: appFrom,
    unit: unit,
    discount: discount,
    max: max,
    startDate: startDate,
    expireDate: expireDate,
    Status: status
  })
  try {
    const Inserted = await Voucher.save();
    if (Inserted) {
      return res.redirect('them-ma-giam-gia');
    }
  } catch (error) {
    console.log(error)
  }

  // console.log({ typeVoucher, remain, limitApply, daterange, status, productId, appFrom, unit, discount, max });
}
const listVoucherPage = async(req, res) => {
  const allVoucher = await VoucherSchema.find({ Status: true }).populate('type');
  res.render('admin/list-voucher', { layout: "./layouts/adminlayout", allVoucher, numberToMoney, addCommaMoney });
}
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
const realTimeInVentory = async(req, res) => {
  const productAll = await ProductStandardSchema.find({ parent: 0 }).populate('ListChild').populate('RealInventory');
  let listRowTable = '';
  for (let i = 0; i < productAll.length; i++) {
    if (productAll[i].ListChild.length > 0) {
      for (let j = 0; j < productAll[i].ListChild.length; j++) {
        let child = productAll[i].ListChild[j];
        let row = `<tr>`;
        if (j == 0) {
          row = `<tr>
          <td rowspan="${productAll[i].ListChild.length != 1 ? productAll[i].ListChild.length : ''}"><input class="form-check-input" type="checkbox"></td>
          <td rowspan="${productAll[i].ListChild.length != 1 ? productAll[i].ListChild.length : ''}"><img class="img-product" src="${productAll[i].img[0]}" alt="" />${productAll[i].name}</td>
          `;
        }
        let productChild = new ProductStandardSchema(child);
        const populated = await productChild.populate('RealInventory');
        row += `
          <td>${populated.models[0].name}</td>
          <td>${populated.RealInventory[0].quantity}</td>
          <td>50</td>
          <td>50</td>
          <td><a href="" class="adjust-price" data-id="<%= child.id%>">Xem lịch sử</a></td>
          </tr>
        `;
        listRowTable += row;
      }
    } else {
      let child = new ProductStandardSchema(productAll[i]);
      let populated = await child.populate('RealInventory');
      let row = `<tr>
          <td><input class="form-check-input" type="checkbox"></td>
          <td><img class="img-product" src="${populated.img[0]}" alt="" />${populated.name}</td>
          <td></td>
          <td>${populated.RealInventory[0].quantity}</td>
          <td>50</td>
          <td>50</td>
          <td><a href="" class="adjust-price" data-id="<%= child.id%>">Xem lịch sử</a></td>
          </tr>
          `;

      listRowTable += row;
    }
  }
  res.render('admin/realTimeInVentory', { layout: "./layouts/adminlayout", listRowTable });
}
const inboundOrder = (req, res) => {
  res.render('admin/inboundOrder', { layout: "./layouts/adminlayout" });
}
const getInboundProduct = async(req, res) => {
  const inboundProduct = await ProductStandardSchema.find({
    $or: [
      { $and: [{ "child.0": { "$exists": false } }, { parent: { $ne: 0 } }] },
      { $and: [{ "child.0": { "$exists": false } }, { parent: 0 }] }
    ]
  });
  return res.json(inboundProduct);
}
const getInboundAndInventoryProduct = async(req, res) => {
  const inboundProduct = await ProductStandardSchema.find({
    $or: [
      { $and: [{ "child.0": { "$exists": false } }, { parent: { $ne: 0 } }] },
      { $and: [{ "child.0": { "$exists": false } }, { parent: 0 }] }
    ]
  }).populate('RealInventory');
  res.json(inboundProduct);
}
const handelInboundProduct = async(req, res) => {
  const { flastImport, confirmInport, DateImport, note, productId, importAmount, importPrice, Supplier } = req.body;
  let { seq } = await CounterSchema.increment('noteId');
  let objInbound = {
    id: seq,
    Supplier,
    DateImport,
    note
  };
  let arrProductInbound = [];
  let total = 0;
  productId.forEach(function(el) {
    arrProductInbound.push({
      id: el,
      amount: importAmount[el],
      price: importPrice[el],
    });
    total += importAmount[el] * importPrice[el];
  });
  objInbound['Product'] = arrProductInbound;
  objInbound['total'] = total;
  try {
    if (confirmInport) {
      objInbound['Status'] = 'dangxuly';
      let inbount = await InboundInventory.create(objInbound);

    } else if (flastImport) {
      objInbound['Status'] = 'hoanthanh';
      let inbount = await InboundInventory.create(objInbound);

      for (let i = 0; i < productId.length; i++) {
        let updated = await InventorySchema.findOneAndUpdate({ productId: productId[i] }, { $inc: { quantity: importAmount[productId[i]] } });
      }
    }
    res.redirect('ds-phieu-nhap-hang');
  } catch (error) {
    next(error)
  }

}
const listInboundOrder = async(req, res) => {
  const inboundComplPromise = InboundInventory.find({ Status: 'hoanthanh' });
  const inboundHandelPromise = InboundInventory.find({ Status: 'dangxuly' });
  const inboundCompl = await inboundComplPromise;
  const inboundHandel = await inboundHandelPromise;
  res.render('admin/listInbound', { layout: "./layouts/adminlayout", formatDate, inboundCompl, inboundHandel, numberToMoney });
}
const adjustInventoryPage = (req, res) => {
  res.render('admin/listAdjustInventory', { layout: "./layouts/adminlayout" })
}
const addAdjustInventory = (req, res) => {
  res.render('admin/ajustInventory', { layout: "./layouts/adminlayout" });
}
module.exports = {
  indexPage,
  writePostPage,
  postPost,
  load_images,
  delete_image,
  danhmucPage,
  themDanhMuc,
  addProductPage,
  addProduct,
  ajaxgetcat,
  addProductStageOne,
  addProductStageTow,
  addProductStageThree,
  add_classify,
  add_model,
  uploadImgProduct,
  addVoucherPage,
  searchProduct,
  addVoucher,
  listVoucherPage,
  listProductPage,
  updateInfoPage,
  realTimeInVentory,
  inboundOrder,
  getInboundProduct,
  handelInboundProduct,
  listInboundOrder,
  adjustInventoryPage,
  addAdjustInventory,
  getInboundAndInventoryProduct
};