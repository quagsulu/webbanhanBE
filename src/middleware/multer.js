import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: 'dweqelkiz',
  api_key: '597117731332249',
  api_secret: '10Shnlq-XGkeHxhO7aX6g1J1hzE'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Tạo public_id tùy chỉnh, ví dụ: sử dụng tên file gốc (bỏ đuôi file) và thêm timestamp
    const public_id = `food_Image/${Date.now()}-${file.originalname.split('.')[0]}`;
    console.log('Generated public_id:', public_id); // kiểm tra giá trị public_id
    return {
      folder: 'food_Image', // Thư mục lưu file trên Cloudinary
      allowedFormats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
      public_id: public_id
    };
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP file types are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Giới hạn file tối đa 5MB
  }
});

export default cloudinary