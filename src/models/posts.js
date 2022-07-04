const { Posts } = require("./schema/post");
const client = require("../helper/connect_elasticsearch");
const addPost = (tieude, ngayviet, noidung, tomtat, img) => {
  return new Promise(async (resolve, reject) => {
    const post = new Posts({ tieude, ngayviet, noidung, tomtat, img });
    try {
      const postAdd = await post.save();
      resolve(postAdd);
    } catch (error) {
      reject(error);
    }
  });
};
const addPostElastic = async (_id, tieude, ngayviet, noidung, tomtat, img) => {
  try {
    await client.index({
      index: "posts",
      id: _id,
      document: {
        tieude: tieude,
        ngayviet: ngayviet,
        tomtat: tomtat,
        noidung: noidung,
        img: img,
      },
    });
    return await 1;
  } catch (error) {
    return await 0;
  }
};
const getAllPost = () => {
  return new Promise((resolve, reject) => {
    Posts.find({}, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};
const getAllPostFromElastic = async () => {
  const documents = await client.search({
    index: "posts",
    query: {
      match_all: {},
    },
  });
  return documents.hits.hits;
};
const getPostFromElasticById = async (id) => {
  const document = await client.get({
    index: "posts",
    id: id,
  });
  return document;
};
const getHighLightPost = async (key) => {
  const documents = await client.search({
    index: "posts",
    query: {
      multi_match: {
        query: key,
        fields: ["tieude", "tomtat", "noidung"],
      },
    },
    highlight: {
      pre_tags: ["<b>"],
      post_tags: ["</b>"],
      fields: {
        noidung: { fragment_size: 150, number_of_fragments: 3 },
        tomtat: { fragment_size: 150, number_of_fragments: 3 },
      },
    },
  });
  return documents;
};
module.exports = {
  getAllPost,
  getAllPostFromElastic,
  getPostFromElasticById,
  getHighLightPost,
  addPost,
  addPostElastic,
};
