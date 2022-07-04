var currencyFormatter = require("currency-formatter");

function numberToMoney(number) {
  return currencyFormatter.format(number, { code: "VND" });
}
function moneyToNumber(money) {
  return currencyFormatter.unformat(money, { code: "VND" });
}

module.exports = { numberToMoney, moneyToNumber };
