import express from 'express';
import { addBanner, getBanners, getBannerById } from '../controllers/bannerController';
import {authenticateJWT} from "../middleware/authMiddleware";
import upload from "../config/multer";

const router = express.Router();

router.post('/create', authenticateJWT, (req, res, next) => {
    req.body.folder = 'banners';
    next();
}, upload.single('image'), addBanner);
router.get('/', getBanners);
router.get('/:id', getBannerById);

export default router;
