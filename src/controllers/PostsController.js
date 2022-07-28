const PostModel = require("../models/posts");
const { TimeStampToDate } = require('../helper/Convert');
const {
  getAllPostFromElastic,

} = require("../models/posts");
const writePostPage = (req, res) => {
  res.render("admin/baiviet", { layout: "./layouts/adminlayout" });
};
const listPost = async(req, res) => {
  const posts = await getAllPostFromElastic();
  console.log(posts);
  res.render('admin/listPost', { layout: "./layouts/adminlayout", posts, TimeStampToDate })
};
const postPost = async(req, res) => {
  const { tieude, tomtat, noidung } = req.body;
  const ngayviet = Date.now();
  const img = "/uploads/img/" + req.file.filename;
  const post = await PostModel.addPost(tieude, ngayviet, noidung, tomtat, img);
  const isSuccess = await PostModel.addPostElastic(
    post._id,
    post.tieude,
    post.ngayviet,
    post.noidung,
    post.tomtat,
    post.img
  );

  if (isSuccess == 1) {
    res.redirect("write-post");
  } else {
    res.send("Có lỗi sảy ra xin thử lại");
  }
};

module.exports = {
  writePostPage,
  postPost,
  listPost
}