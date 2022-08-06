const request = require("request");
const sortObject = require("../helper/sortObject");
const Transaction = require("../models/schema/transaction");
const Order = require("../models/schema/order");
const UserVoucher = require("../models/schema/UserVoucher");
const vnpPayment = async(req, res, next) => {
  var ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  // var config = require('config');
  // var dateFormat = require('dateformat');

  var tmnCode = "GNJJO1IT";
  var secretKey = "ZTHLTEYIBMOZIKEPRTTWOMNDGYUMDESC";
  var vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  var orderId = req.body.vnpayment;
  var returnUrl = process.env.VNPAY_REDIRECT + orderId;
  var createDate = "20220604003641";
  // var amount = req.body.total;
  var amount = 10000;
  var bankCode = "NCB";

  var orderInfo = "Thanh toán đơn hàng";
  var orderType = "billpayment";
  var locale = "vn";
  if (locale === null || locale === "") {
    locale = "vn";
  }
  var currCode = "VND";
  var vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  // vnp_Params['vnp_Merchant'] = ''
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = orderInfo;
  vnp_Params["vnp_OrderType"] = orderType;
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  var querystring = require("qs");
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require("crypto");
  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  res.redirect(vnpUrl);
};
const momoPayment = async(reqest, response, next) => {
  var partnerCode = process.env.PARTNERCODE;
  var accessKey = process.env.ACCESSKEY;
  var secretkey = process.env.SECRETKEY;
  var requestId = partnerCode + new Date().getTime();
  var orderId = requestId;
  var orderInfo = "Thanh toán đơn hàng";
  var redirectUrl = process.env.MOMO_REDIRECT + reqest.body.momopayment;
  var ipnUrl = process.env.MOMO_REDIRECT + reqest.body.momopayment;
  // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
  var amount = "10000";
  var requestType = "captureWallet";
  var extraData = ""; //pass empty value if your merchant does not have stores
  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  const crypto = require("crypto");

  //signature
  var signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");
  const https = require("https");
  //json object send to MoMo endpoint
  const requestBodyStr = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });
  const requestBody = {
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  };
  //Create the HTTPS objects
  const options = {
    uri: "https://test-payment.momo.vn/v2/gateway/api/create",
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBodyStr),
    },
    json: requestBody,
  };
  //Send the request and get the response
  request(options, (error, res, body) => {
    if (!error && res.statusCode == 200) {
      response.redirect(body.payUrl);
    }
    if (error) {
      console.log(error);
    }
  });
};
const checkoutPaypal = async(req, res) => {
  const { code, mode, orderId, status, amount } = req.body;
  try {
    let listVoucherApply = [];
  const updated = await Order.findOneAndUpdate({orderId,isPay: false, status: 'nhapthongtin'}, {
    status: "danggiao",
    isPay: true,
  }, {new: true});
  if (updated) {
    if(updated.discount.voucherId) {
      listVoucherApply.push(updated.discount.voucherId);
    }
    if(updated.shipingDiscount.voucherId) {
      listVoucherApply.push(updated.shipingDiscount.voucherId);
    }
    updated.products.forEach(function(el) {
      if(el.discount.voucherId) {
        listVoucherApply.push(el.discount.voucherId);
      }
    });
    const updateVoucherPromise = UserVoucher.updateMany({userId: updated.userId }, { $set: { "voucher.$[elem].status": false } },{
      "arrayFilters": [
        {
          "elem.id": {
            "$in": listVoucherApply
          },
          "elem.limit" : true
        }
      ]
    });
    const transaction = new Transaction({
      code,
      mode,
      orderId,
      status,
      amount,
    });
    const transactionSaved = await transaction.save();
    if (transactionSaved) {
      res.json({code: 200, message: "success"});
      await updateVoucherPromise
      return;
    }
  }
  } catch (error) {
    console.log(error);
    return res.json({code: 500, message: "error"});
  }
  
};
const VnPayHandel = async(req, res) => {
  const orderId = req.params.orderId;
  const amount = req.query.vnp_Amount;
  const code = req.query.vnp_TransactionNo;
  const status = "success";
  const mode = "VNPAY";
  try {
    let listVoucherApply = [];
    const updated = await Order.findOneAndUpdate({orderId,isPay: false, status: 'nhapthongtin'}, {
      status: "danggiao",
      isPay: true,
    }, {new: true});
    if (updated) {
      if(updated.discount.voucherId) {
        listVoucherApply.push(updated.discount.voucherId);
      }
      if(updated.shipingDiscount.voucherId) {
        listVoucherApply.push(updated.shipingDiscount.voucherId);
      }
      updated.products.forEach(function(el) {
        if(el.discount.voucherId) {
          listVoucherApply.push(el.discount.voucherId);
        }
      });
      const updateVoucherPromise = UserVoucher.updateMany({userId: updated.userId }, { $set: { "voucher.$[elem].status": false } },{
        "arrayFilters": [
          {
            "elem.id": {
              "$in": listVoucherApply
            },
            "elem.limit" : true
          }
        ]
      });
      const transaction = new Transaction({
        code,
        mode,
        orderId,
        status,
        amount,
      });
      const transactionSaved = await transaction.save();
      if (transactionSaved) {
        res.redirect("/checkout/" + orderId);
        await updateVoucherPromise
        return;
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const MomoHandel = async(req, res, next) => {
  const orderId = req.params.orderId;
  const amount = req.query.amount;
  const code = req.query.transId;
  const status = "success";
  const mode = "MOMO";
  try {
    let listVoucherApply = [];
    const updated = await Order.findOneAndUpdate({orderId,isPay: false, status: 'nhapthongtin'}, {
      status: "danggiao",
      isPay: true,
    }, {new: true});
    if (updated) {
      if(updated.discount.voucherId) {
        listVoucherApply.push(updated.discount.voucherId);
      }
      if(updated.shipingDiscount.voucherId) {
        listVoucherApply.push(updated.shipingDiscount.voucherId);
      }
      updated.products.forEach(function(el) {
        if(el.discount.voucherId) {
          listVoucherApply.push(el.discount.voucherId);
        }
      });
      const updateVoucherPromise = UserVoucher.updateMany({userId: updated.userId }, { $set: { "voucher.$[elem].status": false } },{
        "arrayFilters": [
          {
            "elem.id": {
              "$in": listVoucherApply
            },
            "elem.limit" : true
          }
        ]
      });
      const transaction = new Transaction({
        code,
        mode,
        orderId,
        status,
        amount,
      });
      const transactionSaved = await transaction.save();
      if (transactionSaved) {
        res.redirect("/checkout/" + orderId);
        await updateVoucherPromise
        return;
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
module.exports = {
  momoPayment,
  vnpPayment,
  checkoutPaypal,
  VnPayHandel,
  MomoHandel,
}