const { ProductStandardSchema } = require('../models/schema/product_standard');
const { InventorySchema } = require('../models/schema/inventory');
const HistoryChangeInventory = require('../models/schema/HistoryChangeInventory');
const InboundInventory = require("../models/schema/InboundInventory");
const { formatDate } = require('../helper/Convert');
const { CounterSchema } = require("../models/schema/counter");
const { numberToMoney, addCommaMoney } = require('../helper/Convert');
const AdjustInventory = require('../models/schema/AdjustInventory');
const { addMonths } = require('../helper/Convert');
const adjustInventoryPage = async(req, res) => {
  const adjustComplPromise = AdjustInventory.find({ Status: 'hoanthanh' });
  const adjustHandelPromise = AdjustInventory.find({ Status: 'dangxuly' });
  const adjustCompl = await adjustComplPromise;
  const adjustHandel = await adjustHandelPromise;
  res.render('admin/listAdjustInventory', { layout: "./layouts/adminlayout", adjustCompl, adjustHandel, formatDate });
}
const addAdjustInventory = (req, res) => {
  res.render('admin/ajustInventory', { layout: "./layouts/adminlayout" });
}
const completeImport = async(req, res, next) => {
  const inboundId = req.body.inboundId;
  const inboundOrder = await InboundInventory.findOneAndUpdate({ id: inboundId }, { Status: 'hoanthanh' });
  try {
    for (let i = 0; i < inboundOrder.Product.length; i++) {
      let updated = InventorySchema.findOneAndUpdate({ productId: inboundOrder.Product[i].id }, { $inc: { quantity: inboundOrder.Product[i].amount } });
      let created = HistoryChangeInventory.create({
        productId: inboundOrder.Product[i].id,
        typeChange: "Tăng",
        reasonChange: "Nhập hàng vào kho",
        amountChange: inboundOrder.Product[i].amount,
        userChange: 0
      });
      await updated;
      await created;
    }
  } catch (error) {
    next(error)
  }


  res.redirect('ds-phieu-nhap-hang');
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
const listInboundOrder = async(req, res) => {
  const inboundComplPromise = InboundInventory.find({ Status: 'hoanthanh' });
  const inboundHandelPromise = InboundInventory.find({ Status: 'dangxuly' });
  const inboundCompl = await inboundComplPromise;
  const inboundHandel = await inboundHandelPromise;
  res.render('admin/listInbound', { layout: "./layouts/adminlayout", formatDate, inboundCompl, inboundHandel, numberToMoney });
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
        let updated = InventorySchema.findOneAndUpdate({ productId: productId[i] }, { $inc: { quantity: importAmount[productId[i]] } });
        let created = HistoryChangeInventory.create({
          productId: productId[i],
          typeChange: "Tăng",
          reasonChange: "Nhập hàng vào kho",
          amountChange: importAmount[productId[i]],
          userChange: 0
        });
        await updated;
        await created;
      }
    }
    res.redirect('ds-phieu-nhap-hang');
  } catch (error) {
    next(error)
  }

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
const inboundOrder = (req, res) => {
  res.render('admin/inboundOrder', { layout: "./layouts/adminlayout" });
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
          <td><a href="javascript:void(0);" class="history-change" data-id="${populated.id}" data-bs-toggle="modal" data-bs-target="#largeModal">Xem lịch sử</a></td>
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
          <td><a href="" class="history-change" data-id="${populated.id}" data-bs-toggle="modal" data-bs-target="#largeModal">Xem lịch sử</a></td>
          </tr>
          `;

      listRowTable += row;
    }
  }
  res.render('admin/realTimeInVentory', { layout: "./layouts/adminlayout", listRowTable });
}
const postAdjustInventory = async(req, res) => {
  const { flastImport, confirmInport, note, productId, adjustAmount, typeAdjust } = req.body;
  let { seq } = await CounterSchema.increment('noteId');
  let objAdjust = {
    id: seq,
    note
  };
  let arrProductAdjust = [];
  productId.forEach(function(el) {
    arrProductAdjust.push({
      id: el,
      amount: adjustAmount[el],
      typeAdjust: typeAdjust[el],
    });
  });
  objAdjust['Product'] = arrProductAdjust;
  try {
    if (confirmInport) {
      objAdjust['Status'] = 'dangxuly';
      let inbount = await AdjustInventory.create(objAdjust);
    } else if (flastImport) {
      objAdjust['Status'] = 'hoanthanh';
      let inbount = await AdjustInventory.create(objAdjust);
      for (let i = 0; i < productId.length; i++) {
        let amount = 0;
        let typeChange = '';
        if (typeAdjust[productId[i]] === '-') {
          amount = adjustAmount[productId[i]] * -1;
          typeChange = 'Giảm';
        } else {
          amount = adjustAmount[productId[i]];
          typeChange = 'Tăng';
        }
        let updated = InventorySchema.findOneAndUpdate({ productId: productId[i] }, { $inc: { quantity: amount } });
        let created = HistoryChangeInventory.create({
          productId: productId[i],
          typeChange: typeChange,
          reasonChange: "Điều chỉnh tồn kho",
          amountChange: amount,
          userChange: 0
        });
        await updated;
        await created;
      }
    }
    res.redirect('dieu-chinh-ton-kho');
  } catch (error) {
    next(error)
  }
}
const completeAdjust = async(req, res, next) => {
  const { adjustId } = req.body;
  const adjusts = await AdjustInventory.findOneAndUpdate({ id: adjustId }, { Status: 'hoanthanh' });
  try {
    for (let i = 0; i < adjusts.Product.length; i++) {
      let amount = 0;
      let typeChange = '';
      if (adjusts.Product[i].typeAdjust === '-') {
        amount = adjusts.Product[i].amount * -1;
        typeChange = 'Giảm';
      } else {
        amount = adjusts.Product[i].amount;
        typeChange = 'Tăng';
      }
      let updated = InventorySchema.findOneAndUpdate({ productId: adjusts.Product[i].id }, { $inc: { quantity: amount } });
      let created = HistoryChangeInventory.create({
        productId: adjusts.Product[i].id,
        typeChange: typeChange,
        reasonChange: "Điều chỉnh tồn kho",
        amountChange: amount,
        userChange: 0
      });
      await updated;
      await created;
    }
  } catch (error) {
    next(error)
  }


  res.redirect('ds-phieu-nhap-hang');
}
async function getHistoryChangeInventory(month, year, productId) {
  const historyOfCurentTime = await HistoryChangeInventory.find({ $expr: { $and: [{ $eq: [{ $year: "$createdAt" }, year] }, { $eq: [{ $month: "$createdAt" }, month] }, { $eq: ["$productId", productId * 1] }] } });
  return historyOfCurentTime;
}
const getDataHistoryChangeProduct = async(req, res, next) => {
  const { productId } = req.body;
  const responseData = {};
  try {
    for (let i = 0; i < 6; i++) {
      let dateAdd = addMonths(new Date(), (i * -1));
      let month = dateAdd.getMonth() + 1;
      let year = dateAdd.getFullYear();
      const data = await HistoryChangeInventory.aggregate([
        { $project: { productId: 1, createdAt: 1, typeChange: 1, amountChange: 1, "year": { $year: "$createdAt" }, "month": { $month: '$createdAt' } } },
        { $match: { $and: [{ month: month }, { year: year }, { productId: productId * 1 }] } },
        { $group: { _id: '$typeChange', totalChange: { $sum: "$amountChange" } } }
      ]);
      responseData[`${("0" + month).slice(-2)}/${year}`] = {
        'Tăng': 0,
        'Giảm': 0,
        'Month': month,
        "Year": year
      }
      if (data[0]) {
        responseData[`${("0" + month).slice(-2)}/${year}`][data[0]._id] = data[0].totalChange;
      }
      if (data[1]) {
        responseData[`${("0" + month).slice(-2)}/${year}`][data[1]._id] = data[1].totalChange;
      }
    }
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const historyOfCurentTimePromise = getHistoryChangeInventory(currentMonth, currentYear, productId);
    const productPromise = ProductStandardSchema.findOne({ id: productId }, { name: 1, img: 1 });
    const historyOfCurentTime = await historyOfCurentTimePromise;
    const product = await productPromise;
    res.json({ responseData, historyOfCurentTime, product });
  } catch (error) {
    next(error);
  }
}
const getDataHistoryChangeBytime = async(req, res) => {
  const { currentMonth, currentYear, productId } = req.body;
  const historyOfCurentTime = await getHistoryChangeInventory(currentMonth, currentYear, productId);
  res.json(historyOfCurentTime);
}
module.exports = {
  adjustInventoryPage,
  addAdjustInventory,
  completeImport,
  getInboundAndInventoryProduct,
  listInboundOrder,
  handelInboundProduct,
  getInboundProduct,
  inboundOrder,
  realTimeInVentory,
  postAdjustInventory,
  completeAdjust,
  getDataHistoryChangeProduct,
  getDataHistoryChangeBytime
}