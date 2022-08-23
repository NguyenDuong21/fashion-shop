const { ProductStandardSchema } = require("../models/schema/product_standard");
const { InventorySchema } = require("../models/schema/inventory");
const HistoryChangeInventory = require("../models/schema/HistoryChangeInventory");
const InboundInventory = require("../models/schema/InboundInventory");
const { formatDate } = require("../helper/Convert");
const { CounterSchema } = require("../models/schema/counter");
const { numberToMoney, addCommaMoney } = require("../helper/Convert");
const AdjustInventory = require("../models/schema/AdjustInventory");
const { addMonths } = require("../helper/Convert");
const adjustInventoryPage = async (req, res) => {
  const adjustComplPromise = AdjustInventory.find({ Status: "hoanthanh" });
  const adjustHandelPromise = AdjustInventory.find({ Status: "dangxuly" });
  const adjustCompl = await adjustComplPromise;
  const adjustHandel = await adjustHandelPromise;
  res.render("admin/listAdjustInventory", {
    layout: "./layouts/adminlayout",
    adjustCompl,
    adjustHandel,
    formatDate,
  });
};
const addAdjustInventory = (req, res) => {
  res.render("admin/ajustInventory", { layout: "./layouts/adminlayout" });
};
const completeImport = async (req, res, next) => {
  const inboundId = req.body.inboundId;
  const inboundOrder = await InboundInventory.findOneAndUpdate(
    { id: inboundId },
    { Status: "hoanthanh" }
  );
  try {
    for (let i = 0; i < inboundOrder.Product.length; i++) {
      let updated = InventorySchema.findOneAndUpdate(
        { productId: inboundOrder.Product[i].id },
        { $inc: { quantity: inboundOrder.Product[i].amount } }
      );
      let created = HistoryChangeInventory.create({
        productId: inboundOrder.Product[i].id,
        typeChange: "Tăng",
        reasonChange: "Nhập hàng vào kho",
        amountChange: inboundOrder.Product[i].amount,
        userChange: 0,
      });
      await updated;
      await created;
    }
  } catch (error) {
    next(error);
  }

  res.redirect("ds-phieu-nhap-hang");
};
const getInboundAndInventoryProduct = async (req, res) => {
  const inboundProduct = await ProductStandardSchema.find({
    $or: [
      { $and: [{ "child.0": { $exists: false } }, { parent: { $ne: 0 } }, {isCraw: {$ne: true}}] },
      { $and: [{ "child.0": { $exists: false } }, { parent: 0 },{isCraw: {$ne: true}}] },
    ],
  }).populate("RealInventory");
  res.json(inboundProduct);
};
const dataTableAjaxInventory = async (req, res) => {
  try {
    var draw = req.body.draw;

    var start = req.body.start;

    var length = req.body.length;

    var order_data = req.body.order;
    if (typeof order_data == "undefined") {
      var column_name = "name";

      var column_sort_order = "desc";
    } else {
      // var column_index = request.body.order[0]['column'];

      // var column_name = request.body.columns[column_index]['data'];

      var column_name = "name";

      var column_sort_order = req.body.order[0]["dir"];
    }

    //search data

    var search_value = req.body.search["value"];
    let data_arr = [];
    let total_records = await ProductStandardSchema.count({
      $or: [
        { $and: [{ "child.0": { $exists: false } }, { parent: { $ne: 0 } }] },
        { $and: [{ "child.0": { $exists: false } }, { parent: 0 }] },
      ],
    });
    let dataOfTable = await ProductStandardSchema.find({
      name: { $regex: search_value, $options: "i" },
      $or: [
        { $and: [{ "child.0": { $exists: false } }, { parent: { $ne: 0 } }] },
        { $and: [{ "child.0": { $exists: false } }, { parent: 0 }] },
      ],
    })
      .skip(start)
      .limit(length)
      .sort({ [column_name]: column_sort_order })
      .populate("RealInventory");
    dataOfTable.forEach(function (data) {
      let dataImg = '';
      let model = '';
      let dataAmount = '';
      if(data.img.length) {
        dataImg = data.img[0]
      } else {
        dataImg = `/admin/img/illustrations/placeholder-images-product-5_large.webp`;
      }
      if(data.models?.length) {
        model = data.models[0].name
      } else {
        model = '';
      }
      if(data.RealInventory.length >0) {
        dataAmount = data.RealInventory[0]
      } else {
        dataAmount = {};
      }
      data_arr.push({
        id: data.id,
        name: { namePr: data.name, imgPro:  dataImg},
        classifys: model,
        amount : dataAmount
      });
    })
    let total_records_with_filter = await ProductStandardSchema.count({
      name: { $regex: search_value, $options: "i" },
      $or: [
        { $and: [{ "child.0": { $exists: false } }, { parent: { $ne: 0 } }] },
        { $and: [{ "child.0": { $exists: false } }, { parent: 0 }] },
      ],
    })
    var output = {
      'draw': draw,
      'iTotalRecords': total_records,
      'iTotalDisplayRecords': total_records_with_filter,
      'aaData': data_arr
    };

    return res.json(output);
  } catch (error) {
    next(error);
  }
};
const listInboundOrder = async (req, res) => {
  const inboundComplPromise = InboundInventory.find({ Status: "hoanthanh" });
  const inboundHandelPromise = InboundInventory.find({ Status: "dangxuly" });
  const inboundCompl = await inboundComplPromise;
  const inboundHandel = await inboundHandelPromise;
  res.render("admin/listInbound", {
    layout: "./layouts/adminlayout",
    formatDate,
    inboundCompl,
    inboundHandel,
    numberToMoney,
  });
};
const handelInboundProduct = async (req, res) => {
  const {
    flastImport,
    confirmInport,
    DateImport,
    note,
    productId,
    importAmount,
    importPrice,
    Supplier,
  } = req.body;

  if(req.body.confirmChange) {
    let arrProductInbound = [];
    let total = 0;
    let objInbound = {
      Supplier,
      DateImport,
      note,
    };
    productId.forEach(function (el) {
      arrProductInbound.push({
        id: el,
        amount: importAmount[el],
        price: importPrice[el],
      });
      total += importAmount[el] * importPrice[el];
    });
    objInbound["Product"] = arrProductInbound;
    objInbound["total"] = total;
    const updated = await InboundInventory.findOneAndUpdate({id: req.body.confirmChange}, objInbound);
    if(updated) {
      return res.redirect("ds-phieu-nhap-hang");
    } else {
      next(new Error("Canot update"));
    }
  } else {
    let { seq } = await CounterSchema.increment("noteId");
    let objInbound = {
      id: seq,
      Supplier,
      DateImport,
      note,
    };
    let arrProductInbound = [];
    let total = 0;
    productId.forEach(function (el) {
      arrProductInbound.push({
        id: el,
        amount: importAmount[el],
        price: importPrice[el],
      });
      total += importAmount[el] * importPrice[el];
    });
    objInbound["Product"] = arrProductInbound;
    objInbound["total"] = total;
    try {
      if (confirmInport) {
        objInbound["Status"] = "dangxuly";
        let inbount = await InboundInventory.create(objInbound);
      } else if (flastImport) {
        objInbound["Status"] = "hoanthanh";
        let inbount = await InboundInventory.create(objInbound);
  
        for (let i = 0; i < productId.length; i++) {
          let updated = InventorySchema.findOneAndUpdate(
            { productId: productId[i] },
            { $inc: { quantity: importAmount[productId[i]] } }
          );
          let created = HistoryChangeInventory.create({
            adjustId:seq,
            productId: productId[i],
            typeChange: "Tăng",
            reasonChange: "Nhập hàng vào kho",
            amountChange: importAmount[productId[i]],
            userChange: 0,
          });
          await updated;
          await created;
        }
      }
      res.redirect("ds-phieu-nhap-hang");
    } catch (error) {
      next(error);
    }
  }

  
};
const getInboundProduct = async (req, res) => {
  const inboundProduct = await ProductStandardSchema.find({
    $or: [
      { $and: [{ "child.0": { $exists: false } }, { parent: { $ne: 0 } }] },
      { $and: [{ "child.0": { $exists: false } }, { parent: 0 }] },
    ],
  });
  return res.json(inboundProduct);
};
const inboundOrder = (req, res) => {
  res.render("admin/inboundOrder", { layout: "./layouts/adminlayout" });
};
const realTimeInVentory = async (req, res) => {
  const productAll = await ProductStandardSchema.find({
    parent: 0,
    isCraw: { $ne: true },
  })
    .populate("ListChild")
    .populate("RealInventory");
  let listRowTable = "";
  for (let i = 0; i < productAll.length; i++) {
    if (productAll[i].ListChild.length > 0) {
      for (let j = 0; j < productAll[i].ListChild.length; j++) {
        let child = productAll[i].ListChild[j];
        let row = `<tr>`;
        if (j == 0) {
          row = `<tr>
          <td rowspan="${productAll[i].ListChild.length != 1
              ? productAll[i].ListChild.length
              : ""
            }"><input class="form-check-input" type="checkbox"></td>
          <td rowspan="${productAll[i].ListChild.length != 1
              ? productAll[i].ListChild.length
              : ""
            }"><img class="img-product" src="${productAll[i].img[0]}" alt="" />${productAll[i].name
            }</td>
          `;
        }
        let productChild = new ProductStandardSchema(child);
        const populated = await productChild.populate("RealInventory");
        const reservation = populated.RealInventory[0]?.reservation.reduce((total,currentValue) => {
          return total + currentValue.quantity;
        }, 0);
        row += `
          <td>${populated.models[0].name}</td>
          <td>${populated.RealInventory[0].quantity}</td>
          <td>${ reservation ? populated.RealInventory[0]?.quantity - reservation : populated.RealInventory[0]?.quantity}</td>
          <td>${ reservation || 0}</td>
          <td><a href="javascript:void(0);" class="history-change" data-id="${populated.id}" data-bs-toggle="modal" data-bs-target="#largeModal">Xem lịch sử</a></td>
          </tr>
        `;
        listRowTable += row;
      }
    } else {
      let child = new ProductStandardSchema(productAll[i]);
      let populated = await child.populate("RealInventory");
      const reservation = populated.RealInventory[0]?.reservation.reduce((total,currentValue) => {
        return total + currentValue.quantity;
      }, 0);
      let row = `<tr>
          <td><input class="form-check-input" type="checkbox"></td>
          <td><img class="img-product" src="${populated.img[0]}" alt="" />${populated.name}</td>
          <td></td>
          <td>${populated.RealInventory[0]?.quantity}</td>
          <td>${ reservation ? populated.RealInventory[0]?.quantity - reservation : populated.RealInventory[0]?.quantity}</td>
          <td>${ reservation || 0}</td>
          <td><a href="" class="history-change" data-id="${populated.id}" data-bs-toggle="modal" data-bs-target="#largeModal">Xem lịch sử</a></td>
          </tr>
          `;

      listRowTable += row;
    }
  }
  res.render("admin/realTimeInVentory", {
    layout: "./layouts/adminlayout",
    listRowTable,
  });
};
const postAdjustInventory = async (req, res) => {
  const {
    reason,
    flastImport,
    confirmInport,
    note,
    productId,
    adjustAmount,
    typeAdjust,
  } = req.body;
  if(req.body.confirmChange) {
    let arrProductAdjust = [];
    productId.forEach(function (el) {
      arrProductAdjust.push({
        id: el,
        amount: adjustAmount[el],
        typeAdjust: typeAdjust[el],
      });
    });
    const updated = await AdjustInventory.findOneAndUpdate({id: req.body.confirmChange}, {Product: arrProductAdjust, note: note, reason});
    if(updated) {
      
    }
    res.redirect("dieu-chinh-ton-kho"); 
  } else {
    let { seq } = await CounterSchema.increment("noteId");
    let objAdjust = {
      id: seq,
      note,
    };
    let arrProductAdjust = [];
    productId.forEach(function (el) {
      arrProductAdjust.push({
        id: el,
        amount: adjustAmount[el],
        typeAdjust: typeAdjust[el],
      });
    });
    objAdjust["Product"] = arrProductAdjust;
    objAdjust['reason'] = reason;
    try {
      if (confirmInport) {
        objAdjust["Status"] = "dangxuly";
        let inbount = await AdjustInventory.create(objAdjust);
      } else if (flastImport) {
        objAdjust["Status"] = "hoanthanh";
        let inbount = await AdjustInventory.create(objAdjust);
        for (let i = 0; i < productId.length; i++) {
          let amount = 0;
          let typeChange = "";
          if (typeAdjust[productId[i]] === "-") {
            amount = adjustAmount[productId[i]] * -1;
            typeChange = "Giảm";
          } else {
            amount = adjustAmount[productId[i]];
            typeChange = "Tăng";
          }
          let updated = InventorySchema.findOneAndUpdate(
            { productId: productId[i] },
            { $inc: { quantity: amount } }
          );
          let created = HistoryChangeInventory.create({
            adjustId: seq,
            productId: productId[i],
            typeChange: typeChange,
            reasonChange: "Điều chỉnh tồn kho",
            amountChange: amount,
            userChange: 0,
          });
          await updated;
          await created;
        }
      }
      res.redirect("dieu-chinh-ton-kho");
    } catch (error) {
      next(error);
    }
  }
};
const completeAdjust = async (req, res, next) => {
  const { adjustId } = req.body;
  const adjusts = await AdjustInventory.findOneAndUpdate(
    { id: adjustId },
    { Status: "hoanthanh" }
  );
  try {
    for (let i = 0; i < adjusts.Product.length; i++) {
      let amount = 0;
      let typeChange = "";
      if (adjusts.Product[i].typeAdjust === "-") {
        amount = adjusts.Product[i].amount * -1;
        typeChange = "Giảm";
      } else {
        amount = adjusts.Product[i].amount;
        typeChange = "Tăng";
      }
      let updated = InventorySchema.findOneAndUpdate(
        { productId: adjusts.Product[i].id },
        { $inc: { quantity: amount } }
      );
      let created = HistoryChangeInventory.create({
        productId: adjusts.Product[i].id,
        typeChange: typeChange,
        reasonChange: "Điều chỉnh tồn kho",
        amountChange: amount,
        userChange: 0,
      });
      await updated;
      await created;
    }
  } catch (error) {
    next(error);
  }

  res.redirect("ds-phieu-nhap-hang");
};
async function getHistoryChangeInventory(month, year, productId) {
  const historyOfCurentTime = await HistoryChangeInventory.find({
    $expr: {
      $and: [
        { $eq: [{ $year: "$createdAt" }, year] },
        { $eq: [{ $month: "$createdAt" }, month] },
        { $eq: ["$productId", productId * 1] },
      ],
    },
  });
  return historyOfCurentTime;
}
const getDataHistoryChangeProduct = async (req, res, next) => {
  const { productId } = req.body;
  const responseData = {};
  try {
    let curent = new Date();
    curent.setDate(1);
    for (let i = 0; i < 6; i++) {
      let dateAdd = addMonths(curent, i * -1);
      let month = dateAdd.getMonth() + 1;
      let year = dateAdd.getFullYear();
      const data = await HistoryChangeInventory.aggregate([
        {
          $project: {
            productId: 1,
            createdAt: 1,
            typeChange: 1,
            amountChange: 1,
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
        },
        {
          $match: {
            $and: [
              { month: month },
              { year: year },
              { productId: productId * 1 },
            ],
          },
        },
        {
          $group: {
            _id: "$typeChange",
            totalChange: { $sum: "$amountChange" },
          },
        },
      ]);
      responseData[`${("0" + month).slice(-2)}/${year}`] = {
        Tăng: 0,
        Giảm: 0,
        Month: month,
        Year: year,
      };
      if (data[0]) {
        responseData[`${("0" + month).slice(-2)}/${year}`][data[0]._id] =
          data[0].totalChange;
      }
      if (data[1]) {
        responseData[`${("0" + month).slice(-2)}/${year}`][data[1]._id] =
          data[1].totalChange;
      }
    }
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const historyOfCurentTimePromise = getHistoryChangeInventory(
      currentMonth,
      currentYear,
      productId
    );
    const productPromise = ProductStandardSchema.findOne(
      { id: productId },
      { name: 1, img: 1 }
    );
    const historyOfCurentTime = await historyOfCurentTimePromise;
    const product = await productPromise;
    res.json({ responseData, historyOfCurentTime, product });
  } catch (error) {
    next(error);
  }
};
const getDataHistoryChangeBytime = async (req, res) => {
  const { currentMonth, currentYear, productId } = req.body;
  const historyOfCurentTime = await getHistoryChangeInventory(
    currentMonth,
    currentYear,
    productId
  );
  res.json(historyOfCurentTime);
};
const dataTableAjax = async (req, res, next) => {
  try {
    var draw = req.body.draw;

    var start = req.body.start;

    var length = req.body.length;

    var order_data = req.body.order;
    if (typeof order_data == "undefined") {
      var column_name = "name";

      var column_sort_order = "desc";
    } else {
      // var column_index = request.body.order[0]['column'];

      // var column_name = request.body.columns[column_index]['data'];

      var column_name = "name";

      var column_sort_order = req.body.order[0]["dir"];
    }

    //search data

    var search_value = req.body.search["value"];
    let data_arr = [];
    let total_records = await ProductStandardSchema.count({
      $or: [
        { $and: [{ "child.0": { $exists: false } }, { parent: { $ne: 0 } }] },
        { $and: [{ "child.0": { $exists: false } }, { parent: 0 }] },
      ],
    });
    let dataOfTable = await ProductStandardSchema.find({
      name: { $regex: search_value, $options: "i" },
      $or: [
        { $and: [{ "child.0": { $exists: false } }, { parent: { $ne: 0 } }] },
        { $and: [{ "child.0": { $exists: false } }, { parent: 0 }] },
      ],
    })
      .skip(start)
      .limit(length)
      .sort({ [column_name]: column_sort_order });
    dataOfTable.forEach(function (data) {
      let dataImg = '';
      let model = '';
      if(data.img.length) {
        dataImg = data.img[0]
      } else {
        dataImg = `/admin/img/illustrations/placeholder-images-product-5_large.webp`;
      }
      if(data.models?.length) {
        model = data.models[0].name
      } else {
        model = '';
      }
      data_arr.push({
        id: data.id,
        name: { namePr: data.name, imgPro:  dataImg},
        classifys: model,
      });
    })
    let total_records_with_filter = await ProductStandardSchema.count({
      name: { $regex: search_value, $options: "i" },
      $or: [
        { $and: [{ "child.0": { $exists: false } }, { parent: { $ne: 0 } }] },
        { $and: [{ "child.0": { $exists: false } }, { parent: 0 }] },
      ],
    })
    var output = {
      'draw': draw,
      'iTotalRecords': total_records,
      'iTotalDisplayRecords': total_records_with_filter,
      'aaData': data_arr
    };

    return res.json(output);
  } catch (error) {
    next(error);
  }
};
const changeAdjustInventory = async (req, res, next) => {
  const adjustId = req.query['q'];
  try {
    const adjustStock = await AdjustInventory.findOne({id:adjustId}).populate({
      path : 'AdjustProduct',
      select: 'name price models img',
      populate : {
        path : 'RealInventory'
      }
    });
    if(adjustStock) {
      res.render("admin/changeAjustInventory", { layout: "./layouts/adminlayout", adjustStock, adjustId });
    } else {
      res.render("");
    }
  } catch (error) {
    next(error);
  }
  
}
const viewAdjustInventory = async (req, res, next) => {
  const adjustId = req.query['q'];
  try {
    const adjustStock = await AdjustInventory.findOne({id:adjustId}).populate({
      path : 'AdjustProduct',
      select: 'name price models img',
      populate : {
        path : 'RealInventory'
      }
    });
    if(adjustStock) {
      res.render("admin/viewAjustInventory", { layout: "./layouts/adminlayout", adjustStock, adjustId });
    } else {
      res.render("");
    }
  } catch (error) {
    next(error);
  }
}
const adjustInboundOrder = async (req, res, next) => {
  const id = req.query['q'];
  const inboundOrder = await InboundInventory.findOne({id}).populate('ImportProduct', 'id name img models');
  res.render("admin/adjustInboundOrder", { layout: "./layouts/adminlayout" , adjustId:id, inboundOrder, numberToMoney});
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
  getDataHistoryChangeBytime,
  dataTableAjax,
  dataTableAjaxInventory,
  changeAdjustInventory,
  viewAdjustInventory,
  adjustInboundOrder
};
