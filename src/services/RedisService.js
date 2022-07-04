require("dotenv").config();
const redis = require("redis");
const client = redis.createClient({
  url: process.env.REDIS_URL,
});
client.connect();
client.ping((err, pong) => {
  console.log(pong);
});
client.on("error", (err) => {
  console.log(err);
});
client.on("connected", (err) => {
  console.log("connected");
});
client.on("ready", (err) => {
  console.log("Redis is ready");
});

module.exports = client;
