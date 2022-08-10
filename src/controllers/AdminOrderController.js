const Order = require("../models/schema/order");
const transaction = require("../models/schema/transaction");
const { numberToMoney, convertVNDtoUSD, formatDate } = require("../helper/Convert");

var that = module.exports = {
    listOrderAdminPage : async(req, res, next) => {
        let listOrder = await Order.find({}, {userId:1, total: 1,products:1, createdAt: 1, isPay: 1, status: 1}).populate('Product', 'id').populate('Customer', 'userName');
        return res.render("admin/list-order", { layout: "./layouts/adminlayout", listOrder,numberToMoney ,formatDate});
    },
    adminDetaildOrder : async(req, res, next) => {
        let orderId = req.query.o;
        try {
            let curentOrder = await Order.findOne({ _id: orderId}).populate('Product');
            let transOrder = await transaction.findOne({orderId});
            return res.render("admin/admin-detail-order", { layout: "./layouts/adminlayout",numberToMoney ,formatDate,curentOrder,transOrder})
        } catch (error) {
            next(error);
        }
    }
}