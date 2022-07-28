const {
  getAllPostFromElastic,
  getPostFromElasticById,
  getHighLightPost,
} = require("../models/posts");
const { TimeStampToDate } = require('../helper/Convert');

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
    res.render("xe-mart/blog", { posts, TimeStampToDate });
  } else {
    postsEletic.forEach((element) => {
      element._source._id = element._id;
      posts.push(element._source);
    });
    res.render("xe-mart/blog", { posts, TimeStampToDate });
  }
};
const blogDetailPage = async(req, res) => {
  const id = req.params.id;
  const post = await getPostFromElasticById(id);
  res.render("xe-mart/blog-detail", { post });
};
module.exports = {
  blogsPage,
  blogDetailPage
}