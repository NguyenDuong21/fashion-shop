require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  cloud: {
    id: process.env.ID_ELASTIC,
  },
  auth: {
    username: process.env.UNAME_ELASTIC,
    password: process.env.PASS_ELASTIC,
  },
});

module.exports = client;
