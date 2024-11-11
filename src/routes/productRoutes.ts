import { Router } from 'express';
import {createProduct, deleteProduct, getProductByBrand, getProductById, getProductBySlug, getProducts, getProductsByCategory, searchProducts} from '../controllers/productController';
import {authenticateJWT} from "../middleware/authMiddleware";
import upload from "../config/multer";

const router = Router();

router.get('/search', searchProducts)
router.get('/:slug', getProductBySlug);
router.post('/create', authenticateJWT, (req, res, next) => {
    req.body.folder = 'products';
    next();
}, upload.single('image'), createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);
router.delete('/:id', authenticateJWT, deleteProduct);
router.get('/brand/:slug', getProductByBrand);


export default router;
