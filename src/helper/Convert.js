var currencyFormatter = require("currency-formatter");
var voucher_codes = require("voucher-code-generator");
const slug = require("slug");
const CC = require("currency-converter-lt");
const moment = require('moment');

function numberToMoney(number) {
  return currencyFormatter.format(number, { code: "VND" });
}

function formatDate(date) {
  return moment(date).format('DD/MM/YYYY HH:MM');
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
module.exports = {
  numberToMoney,
  moneyToNumber,
  createCoupon,
  convertVNDtoUSD,
  slugify,
  addCommaMoney,
  formatDate
};