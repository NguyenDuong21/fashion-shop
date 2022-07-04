require("dotenv").config();
const viewEngine = require("./config/viewEngine");
const webRoutes = require("./routes/web");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");
const productRouter = require("./routes/product");
const { homePage } = require("./controllers/home");
mongoose.connect(process.env.MONGO_DB_URI);
const conn = mongoose.createConnection(process.env.MONGO_DB_URI);
var expressLayouts = require("express-ejs-layouts");
const mainRoute = require("./routes/main");
const adminRouter = require("./routes/admin");
const cartRouter = require("./routes/cart");
const session = require("express-session");
const MongoStore = require("connect-mongo");
var morgan = require("morgan"); // rename logger to morgan
const logger = require("./logs/logger");
const SocketServices = require("./services/SocketServices");
const JwtServices = require("./services/JwtService");
const logDB = require("./helper/logdbfunc");
require("dotenv").config();
global._io = io;
global.__basedir = __dirname;
const changeStream = conn.watch().on("change", logDB);

app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 15 * 60 * 1000 },
    store: MongoStore.create({ mongoUrl: process.env.MONGO_DB_URI }),
  })
);
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
//config view Engine
viewEngine(app);

//config route for app
webRoutes(app);
app.use("/product", productRouter);
app.get("/", homePage);
app.use(mainRoute);
app.use("/admin", adminRouter);
app.use("/cart", cartRouter);
app.post("/getJwt", async (req, res) => {
  const { userid } = req.body;
  const accessToken = await JwtServices.signAccessToken(userid);
  const refreshToken = await JwtServices.signRefreshsToken(userid);
  res.json({
    status: "success",
    message: {
      accessToken,
      refreshToken,
    },
  });
});
app.use(express.static(__dirname + "/public"));
const _handerError = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} ` + err.message);
  const errorMsg = err.message;
  res.status(err.status || 500).json({
    code: -1,
    status: `error`,
    message: errorMsg,
    elements: {},
  });
};

app.use(_handerError);
global._io.use(async (socket, next) => {
  const { token } = socket.handshake.headers;

  if (token) {
    const accessToken = token.split(" ")[1];
    try {
      const isVerify = await JwtServices.verifyAccessToken(accessToken);
      if (isVerify) return next();
      else return next(new Error("accessToken not exactly"));
    } catch (error) {
      next(new Error(error));
    }
  }
  return next(new Error("No Authentication"));
});
global._io.on("connection", SocketServices.connection);
http.listen(PORT, () => {
  console.log("Listen " + PORT);
});
