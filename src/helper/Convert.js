var currencyFormatter = require("currency-formatter");
var voucher_codes = require("voucher-code-generator");
const { InventorySchema } = require("../models/schema/inventory")
const slug = require("slug");
const CC = require("currency-converter-lt");
const moment = require('moment');
const Order = require("../models/schema/order");
const { uuid } = require('uuidv4');

const setIdDevice = (req, res, next) => {
  try {
    if (!req.signedCookies.uid) {
      res.cookie('uid', uuid(), { signed: true, httpOnly: true, secure: true });
    }
    next();
  } catch (error) {
    next(error);
  }
}

function numberToMoney(number) {
  return currencyFormatter.format(number, { code: "VND" });
}

function formatEmail(emilString) {
  var splitEmail = emilString.split("@")
  var domain = splitEmail[1];
  var name = splitEmail[0];
  return name.substring(0, 3).concat("*********@").concat(domain)
}

function formatDate(date) {
  return moment(date).format('DD/MM/YYYY HH:MM');
}

function TimeStampToDate(timestamp) {
  return moment.unix(timestamp).format('DD/MM/YYYY HH:MM');
}

function addCommaMoney(par) {
  if (par) {
    return par.toString().trim().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  } else {
    return '';
  }
}

function moneyToNumber(money) {
  return currencyFormatter.unformat(money, { code: "VND" });
}

function createCoupon(length, count) {
  return voucher_codes.generate({
    length: length,
    count: count,
  });
}
async function convertVNDtoUSD(amount) {
  let currencyConverter = new CC();
  const res = await currencyConverter
    .from("VND")
    .to("USD")
    .amount(amount)
    .convert();
  return res;
}

function slugify(param, repl) {
  return slug(param, repl);
}

function addMonths(date, months) {
  date.setMonth(date.getMonth() + months);
  return date;
}
async function cancelOrder(userId, productIds) {
  const cancel = await InventorySchema.updateMany({ id: { $in: productIds } }, { $pull: { reservation: { userId: userId } } }, { new: true });
  console.log(cancel);
  return cancel;
}
const paramMiddleware = (redirect) => {
  return (req, res, next) => {
    req.session.redirect = redirect;
    next();
  }
};
const caculatorTotalOrder = async(orderId) => {
  let order = await Order.findOne({ _id: orderId });
  let total = 0;
  let subTotal = 0;
  order.products.forEach(function(el) {
    total += el.qty * (el.price - el.discount.amount);
  });
  subTotal = total;
  total += order.shiping - order.shipingDiscount.amount;
  total -= order.discount.amount;
  return { subTotal, total };
}
module.exports = {
  numberToMoney,
  moneyToNumber,
  createCoupon,
  convertVNDtoUSD,
  slugify,
  addCommaMoney,
  formatDate,
  TimeStampToDate,
  addMonths,
  formatEmail,
  setIdDevice,
  cancelOrder,
  paramMiddleware,
  caculatorTotalOrder
};