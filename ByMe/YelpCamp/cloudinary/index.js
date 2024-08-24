// https://www.npmjs.com/package/cloudinary
const cloudinary = require('cloudinary').v2;
// https://www.npmjs.com/package/multer-storage-cloudinary
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',
        allowedFormats: ['jpeg', 'png', 'jpg','mp4', 'avi', 'mov'],
        resource_type: 'auto' // 自动识别文件类型（图片、视频等）
    }
});

module.exports = {
    cloudinary,
    storage
}