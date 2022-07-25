const client = require("../services/RedisService");
require("dotenv").config();
const { getProductlimit, getOneProductById } = require("../models/product");
const path = require("path");
const nodemailer = require("nodemailer");
const request = require("request");
const {
  getAllPost,
  getAllPostFromElastic,
  getPostFromElasticById,
  getHighLightPost,
} = require("../models/posts");
const { valRegister } = require("../helper/validate-register");
const User = require("../models/schema/user");
const Login = require("../models/schema/login");
const Cart = require("../models/schema/cart");
const { ProductSchema } = require("../models/schema/products");
const { numberToMoney } = require("../helper/Convert");
const sortObject = require("../helper/sortObject");
const { ProductStandardSchema } = require("../models/schema/product_standard");
const { InventorySchema } = require("../models/schema/inventory");
const { CategorySchema } = require("../models/schema/category");

const searchProduct = async(req, res) => {
  const valSearch = req.query.searchField;
  const product = await ProductSchema.find({
    name: { $regex: valSearch, $options: "i" },
  });
  res.json({
    message: "success",
    productSearch: product,
  });
};

const testpost = async(req, res) => {
  const posts = await getAllPostFromElastic();
  return res.json(posts);
};
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
const homePage = async(req, res) => {
  // const productsFirst = await getProductlimit(20, 13);
  // const productsSecond = await getProductlimit(80, 12);
  // if (req.session && req.session.cart) {
  //   const lengthItem = req.session.cart.items.length;
  // }
  const userLogin = req.session.user;

  res.render("xe-mart/index", {
    layout: false,
    // productsFirst,
    // productsSecond,
    // userLogin,
  });
};
const blogsPage = async(req, res) => {
  const postsEletic = await getAllPostFromElastic();
  const posts = [];
  if (req.query.key) {
    const key = req.query.key;
    let data = await getHighLightPost(key);
    data = data.hits.hits;
    const posts = [];
    data.forEach(function(el) {
      let obj = {
        _id: el._id,
        tieude: el._source.tieude,
        noidung: el._source.noidung,
        ngayviet: el._source.ngayviet,
        img: el._source.img,
      };
      if (el.highlight.noidung) {
        obj["tomtat"] = el.highlight.noidung;
      } else if (el.highlight.tomtat) {
        obj["tomtat"] = el.highlight.tomtat;
      } else {
        obj["tomtat"] = el._source.tomtat;
      }
      posts.push(obj);
    });
    res.render("blogs", { posts });
  } else {
    postsEletic.forEach((element) => {
      element._source._id = element._id;
      posts.push(element._source);
    });
    res.render("blogs", { posts });
  }
};
const blogDetailPage = async(req, res) => {
  const id = req.params.id;
  const post = await getPostFromElasticById(id);
  res.render("blogdetail", { post });
};
const detailPage = async(req, res) => {
  const productID = req.query.spid;
  const products = await ProductStandardSchema.findOne({ id: productID });
  res.render("xe-mart/detail", { products, numberToMoney });
  // if (req.query.isAjax) {
  //   res.json(product);
  // } else {
  //   res.render("detail", { product });
  // }
};
const cartPage = async(req, res) => {
  let cart = await client.get(req.session.user._id);
  if (!cart) return res.render("cart", { cart, numberToMoney });
  else {
    cart = JSON.parse(cart);
  }
  cart = new Cart(cart);
  cart = await cart.populate({
    path: "items.productId",
    select: ["name", "price"],
  });

  res.render("cart", { cart, numberToMoney });
};
const loginPage = (req, res) => {
  if (!req.session.user) {
    res.render("login");
  } else {
    res.redirect("/");
  }
};
const registerAccount = async(req, res) => {
  const { email, username, password, confirmpassword } = req.body;
  try {
    const value = await valRegister.validateAsync({
      email,
      username,
      password,
      confirmpassword,
    });
    if (value) {
      const newUser = new User({ email: email, password: password });
      const insertedUser = await newUser.save();
      const newLogin = new Login({
        username: username,
        userId: insertedUser._id,
        role: "628eecce8c4372fb2e8f6455",
      });
      const insertedLogin = await newLogin.save();
      if (insertedLogin) {
        return res.redirect("/login");
      }
    }
  } catch (error) {
    return res.send({
      status: 500,
      message: error.message,
    });
  }
};
const loginAccount = async(req, res) => {
  const { email, password } = req.body;

  const userLogin = await User.findOne({ email });
  if (userLogin) {
    try {
      const isValid = await userLogin.isValidPass(password);
      if (isValid) {
        req.session.user = userLogin;
        res.redirect("/");
      } else {
        res.send("Tài khoản hoăc mk ko chính xác");
      }
    } catch (error) {
      return res.send({
        status: 500,
        message: error.message,
      });
    }
  } else {
    return res.send({
      status: 304,
      message: "Email or password invalid",
    });
  }
};

const testSendMail = async(req, res) => {
  const { email } = req.body;
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "thien123111888@gmail.com", // generated ethereal user
      pass: "mywnafphxbkoklpk", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "thien123111888@gmail.com", // sender address
    to: `${email}`, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "Fred Foo 👻 <b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};
const testSocket = async(req, res) => {
  return res.sendFile(__basedir + "/views/testsocket.html");
};
const getModelProduct = async(req, res) => {
  let { spid, combineCondition } = req.body;
  let product = await ProductStandardSchema.findOne({ id: spid });

  for (let i = 0; i < product.models.length; i++) {
    if (product.models[i].name === combineCondition) {
      const _id = product.models[i]._id;
      const productModel = await ProductStandardSchema.findChildModel(_id);
      const inventory = await InventorySchema.findOne({ productId: productModel.id });
      return res.json({ message: 'success', model: { price: productModel.price, normal_stock: inventory.quantity } });
    }
  }
  return res.json({ message: "error" })
}
const categoryPage = async(req, res, next) => {
  let catPath = req.params.cat_path;
  let arr_CatId = catPath.split('.');
  let parent_catid = '';
  if (arr_CatId.length == 3) {
    parent_catid = arr_CatId.at(-2);
  } else {
    parent_catid = arr_CatId.at(-1);
  }
  let activeCat = arr_CatId.at(-1);
  try {
    const childCat = await CategorySchema.findOne({ level: 1, catid: parent_catid }).populate('ListCat');
    res.render('xe-mart/category', { childCat, activeCat });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  homePage,
  detailPage,
  cartPage,
  loginPage,
  registerAccount,
  loginAccount,
  blogsPage,
  blogDetailPage,
  testpost,
  vnpPayment,
  momoPayment,
  searchProduct,
  testSendMail,
  testSocket,
  getModelProduct,
  categoryPage
};