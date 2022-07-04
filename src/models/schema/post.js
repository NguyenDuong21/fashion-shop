const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    tieude: String,
    tomtat: String,
    noidung: String,
    ngayviet: String,
    img: String,
  },
  { collection: "posts" }
);

module.exports = { Posts: mongoose.model("posts", postSchema) };
