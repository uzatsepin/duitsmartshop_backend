import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';
import { UploadApiOptions } from 'cloudinary';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file): Promise<UploadApiOptions> => {
        const folderName = req.baseUrl.includes('/banners') ? 'banners' : 'products';

        return {
            folder: folderName,
            allowed_formats: ['png', 'jpg', 'jpeg', 'webp'],
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };
    },
});

const upload = multer({ storage });
export default upload;
