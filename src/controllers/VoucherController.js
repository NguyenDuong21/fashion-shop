const TypeVoucher = require("../models/schema/TypeVoucher");
const VoucherSchema = require("../models/schema/Voucher");
const UserVoucherSchema = require("../models/schema/UserVoucher");
const { ProductStandardSchema } = require("../models/schema/product_standard");
const {
  numberToMoney,
  addCommaMoney,
  formatDateMonYear,
} = require("../helper/Convert");
const moment = require("moment");
const Voucher = require("../models/schema/Voucher");
const clientVoucherPage = async (req, res) => {
  const currentDate = new Date();
  const { userId } = req.payload;
  let listVoucherOfUser = await UserVoucherSchema.findOne(
    { userId },
    { _id: 0, "voucher.id": 1 }
  );
  let listVoucherId = listVoucherOfUser?.voucher.map((el) => el.id);
  const allVoucher = await VoucherSchema.find({
    Status: true,
    amount: { $gt: 0 },
    startDate: { $lte: currentDate },
    expireDate: { $gt: currentDate },
    _id: { $nin: listVoucherId },
  })
    .populate("type")
    .populate("VoucherProduct", "name");
  res.render("xe-mart/list-voucher", {
    allVoucher,
    numberToMoney,
    addCommaMoney,
  });
};
const addVoucherPage = async (req, res) => {
  const idVoucher = req.query["id"];
  let curVoucher = {};
  if (idVoucher) {
    curVoucher = await VoucherSchema.findById({ _id: idVoucher }).populate(
      "VoucherProduct",
      "name id"
    );
  }
  const voucherTypes = await TypeVoucher.find();
  return res.render("admin/them-voucher", {
    layout: "./layouts/adminlayout",
    voucherTypes,
    curVoucher,
    addCommaMoney,
    formatDateMonYear,
    numberToMoney,
  });
};
const searchProduct = async (req, res) => {
  const valSearch = req.query.q;
  const product = await ProductStandardSchema.find({
    name: { $regex: valSearch, $options: "i" },
    $or: [
      {
        $and: [
          { parent: 0 },
          { isCraw: { $ne: true } },
          { "child.0": { $exists: false } },
        ],
      },
      {
        $and: [
          { parent: { $ne: 0 } },
          { isCraw: { $ne: true } },
          { "child.0": { $exists: false } },
        ],
      },
    ],
  });
  res.json(product);
};
const addVoucher = async (req, res, next) => {
  let {
    typeVoucher,
    remain,
    limitApply,
    daterange,
    status,
    productId,
    appFrom,
    unit,
    discount,
    max,
  } = req.body;
  if (productId === undefined) {
    productId = [];
  }
  let [startDate, expireDate] = daterange.split("-");
  startDate = startDate.trim();
  expireDate = expireDate.trim();
  startDate = moment(startDate, "DD/MM/YYYY").toDate();
  expireDate = moment(expireDate, "DD/MM/YYYY").toDate();
  try {
    if (req.body.sua) {
      const idVoucher = req.body.sua;
      const updated = await VoucherSchema.findOneAndUpdate({ _id: idVoucher }, {
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
      });
      if(updated) {
        return res.redirect('/admin/danh-sach-voucher');
      }
    } else {
      console.log("Thêm");

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
        Status: status,
      });
      const Inserted = await Voucher.save();
      if (Inserted) {
        return res.redirect("/admin/them-ma-giam-gia");
      }
    }
  } catch (error) {
    next(error);
  }
};
const listVoucherPage = async (req, res) => {
  const allVoucher = await VoucherSchema.find({ Status: true }).populate(
    "type"
  );
  res.render("admin/list-voucher", {
    layout: "./layouts/adminlayout",
    allVoucher,
    numberToMoney,
    addCommaMoney,
  });
};
const saveVoucher = async (req, res, next) => {
  const { voucherId } = req.body;
  const { userId } = req.payload;
  try {
    const voucher = await Voucher.findOneAndUpdate(
      { _id: voucherId },
      { $inc: { amount: -1 } }
    );
    const voucherSaved = await UserVoucherSchema.findOneAndUpdate(
      { userId },
      {
        $push: {
          voucher: {
            id: voucherId,
            limit: voucher.limit,
            status: true,
          },
        },
      },
      { upsert: true }
    );
    return res.json({ code: 200, message: "success" });
  } catch (error) {
    res.json({ code: 500, message: "error" });
    next(error);
  }
};
module.exports = {
  addVoucherPage,
  searchProduct,
  addVoucher,
  listVoucherPage,
  clientVoucherPage,
  saveVoucher,
};
