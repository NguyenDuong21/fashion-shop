const cloudinary = require('cloudinary').v2;
require('dotenv').config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

exports.uploads = (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file, { folder: folder })
      .then((result) => {
        resolve(result.url)
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      })
  });
}