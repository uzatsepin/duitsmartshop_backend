import { Router } from 'express';
import { createRole } from '../controllers/roleController';

const router = Router();

router.post('/create', createRole);

export default router;
