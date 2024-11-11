import { Router } from 'express';
import { createBrand, getBrandBySlug, getBrands } from '../controllers/brandController';

const router = Router();

router.post('/create', createBrand);

router.get('/', getBrands);

router.get('/:slug', getBrandBySlug);

export default router;
