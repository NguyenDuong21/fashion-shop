var FroalaEditor = require("wysiwyg-editor-node-sdk/lib/froalaEditor.js");
const { CategorySchema } = require("../models/schema/category");
const fs = require('fs');
const indexPage = (req, res) => {
  res.render("admin/index", { layout: "./layouts/adminlayout" });
};

const danhmucPage = async(req, res) => {
  const AllCate = await CategorySchema.find({ level: 1 }).populate('ListCat');
  res.render("admin/danh-muc", { layout: "./layouts/adminlayout", AllCate });
}
const load_images = (req, res) => {
  FroalaEditor.Image.list("/public/uploads/img/", function(err, data) {
    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    for (let i = 0; i < data.length; i++) {
      data[i].url = data[i].url.replace("/public", "");
      data[i].thumb = data[i].thumb.replace("/public", "");
    }
    return res.send(data);
  });
};
const delete_image = (req, res) => {
  FroalaEditor.Image.delete("/public" + req.body.src, function(err) {
    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    return res.end();
  });
};

const themDanhMuc = async(req, res) => {
  const { parentId, catAddName } = req.body;
  const id = Math.floor(Math.random() * (99999999 - 10000000)) + 10000000;
  const Cat = new CategorySchema({ catid: id, parent_catid: parentId, name: catAddName, display_name: catAddName, url_path: catAddName.replace(/[\,\.]/g, '').replace(/ /g, '-') + `.${id}`, children: null, level: 2 });
  try {
    const inserted = await Cat.save();
    const updated = await CategorySchema.findOneAndUpdate({ catid: parentId }, { $push: { children: inserted.catid } }, { new: true });
    if (updated) {
      return res.json({ message: "success" });
    }
    return res.json({ message: "error" });
  } catch (error) {
    console.log(error);
    return res.json({ message: "error" });

  }
}

const ajaxgetcat = async(req, res) => {
  const catParentId = req.body.catId;
  const childCat = await CategorySchema.find({ parent_catid: catParentId, level: 2 });
  res.json({ childCat });
}
module.exports = {
  indexPage,
  load_images,
  delete_image,
  danhmucPage,
  themDanhMuc,
  ajaxgetcat,
};