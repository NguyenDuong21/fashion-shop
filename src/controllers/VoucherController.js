const TypeVoucher = require("../models/schema/TypeVoucher");
const VoucherSchema = require("../models/schema/Voucher");
const { ProductStandardSchema } = require('../models/schema/product_standard');
const { numberToMoney, addCommaMoney } = require('../helper/Convert');
const moment = require("moment");
const clientVoucherPage = async(req, res) => {
  const allVoucher = await VoucherSchema.find({ Status: true }).populate('type');
  res.render('xe-mart/list-voucher', { allVoucher, numberToMoney, addCommaMoney });
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
module.exports = {
  addVoucherPage,
  searchProduct,
  addVoucher,
  listVoucherPage,
  clientVoucherPage
}