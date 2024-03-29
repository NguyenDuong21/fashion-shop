require("dotenv").config();
const viewEngine = require("./config/viewEngine");
const webRoutes = require("./routes/web");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB_URI_LOCAL);
const conn = mongoose.createConnection(process.env.MONGO_DB_URI_LOCAL);
var expressLayouts = require("express-ejs-layouts");
const mainRoute = require("./routes/main");
const adminRouter = require("./routes/admin");
const cartRouter = require("./routes/cart");
const authRouter = require("./routes/auth");
const logger = require("./logs/logger");
const SocketServices = require("./services/SocketServices");
const logDB = require("./helper/logdbfunc");
const { CategorySchema } = require('./models/schema/category');
const cookieParser = require('cookie-parser');
const { client } = require('./services/RedisService');
const session = require('express-session')
const MongoStore = require('connect-mongo');
require("dotenv").config();
require('./services/AuthWithGoogleFacebook');
const passport = require('passport');
global._io = io;
global.__basedir = __dirname;
const changeStream = conn.watch().on("change", logDB);
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SECRET_SESSION,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_DB_URI_LOCAL }),
  cookie: { maxAge: 60000 }
}));
app.use(cookieParser(process.env.COOKIE_SECRET_KEY));
app.use(passport.initialize());
app.use(passport.session());
const PORT = process.env.PORT || 8080;

const getCatMenu = async(req, res, next) => {
  try {
    const Cat = await CategorySchema.find({ level: 1 });
    const login = req.payload || false;
    res.locals.catMenu = Cat;
    next();
  } catch (error) {
    next(error);
  }
}
app.use(getCatMenu);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
//config view Engine
viewEngine(app);

//config route for app
webRoutes(app);
app.use("/admin", adminRouter);
app.use(mainRoute);
app.use("/cart", cartRouter);
app.use("/auth", authRouter);
const _handerError = (err, req, res, next) => {
  if (err.status === 404) {
    res.render('xe-mart/404.ejs');
  } else {
    logger.error(`${req.method} ${req.originalUrl} ` + err.message);
    const errorMsg = err.message;
    res.status(err.status || 500).json({
      code: -1,
      status: `error`,
      message: errorMsg,
      elements: {},
    });
  }

};

// global._io.use(async(socket, next) => {
//   const { token } = socket.handshake.headers;

//   if (token) {
//     const accessToken = token.split(" ")[1];
//     try {
//       const isVerify = await JwtServices.verifyAccessToken(accessToken);
//       if (isVerify) return next();
//       else return next(new Error("accessToken not exactly"));
//     } catch (error) {
//       next(new Error(error));
//     }
//   }
//   return next(new Error("No Authentication"));
// });
app.use(_handerError);
app.get('*', function(req, res) {
  res.status(404).render('xe-mart/404.ejs', { layout: false });
});
global._io.on("connection", SocketServices.connection);
http.listen(PORT, () => {
  console.log("Listen " + PORT);
});