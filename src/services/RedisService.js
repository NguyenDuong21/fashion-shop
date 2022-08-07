require("dotenv").config();
const Redis = require("ioredis");
const client = new Redis(process.env.REDIS_URL);
// const client = new Redis();
const addProduct = async(userId, productId, quantity) => {
  const numInc = await client.hincrby(`cart:${userId}`, productId, quantity);
  return numInc;
};
const minusProduct = async(userId, productId) => {
  const numInc = await client.hincrby(`cart:${userId}`, productId, -1);
  if (numInc <= 0) {
    await client.hdel(`cart:${userId}`, productId);
  }
  return numInc;
};
const getAllCart = async(userId) => {
  const cart = await client.hgetall(`cart:${userId}`);
  return cart;
}
const setAllCart = async(userId, objProduct) => {
  const cart = await client.hmset(`cart:${userId}`, objProduct);
  return cart;
}
const delProduct = async(userid, productId) => {
  const deleted = await client.hdel(`cart:${userid}`, productId);
  return deleted;
}
const delAllCart = async(userId) => {
  const deleted = await client.del(`cart:${userId}`);
  return deleted;
}
module.exports = { client, addProduct, minusProduct, getAllCart, setAllCart, delAllCart, delProduct };