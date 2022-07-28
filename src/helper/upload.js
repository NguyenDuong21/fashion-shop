const multer = require("multer");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "src/public/uploads/img");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpge' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true)
  } else {
    cb({ message: "Unsuport File format" }, false)
  }
}

var upload = multer({ storage: storage, limits: { fieldSize: 1024 * 1024 }, fileFilter: fileFilter });
module.exports = upload;