const Transaction = require("../models/schema/transaction");
const { numberToMoney, formatDate } = require('../helper/Convert');


var that = module.exports = {
    adminTransactionPage : async (req, res, next) => {
        let allTransaction = await Transaction.find({});
        return res.render("admin/Transaction-page", { layout: "./layouts/adminlayout", allTransaction, numberToMoney, formatDate});
    },
    getTranDetail : async (req, res, next) => {
        let {transId} = req.body;
        try {
            let targetTransaction = await Transaction.findById(transId).populate({
                path:"TranOrder",
                populate : {
                    path: "Product Customer",
                }
            });
            return res.json({code: 200, message: targetTransaction});
        } catch (error) {
            return res.json({code: 500, message: error.message});
        }
        
    }
}