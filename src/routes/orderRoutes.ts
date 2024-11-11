import { Router } from 'express';
import { createRole } from '../controllers/roleController';
import { createOrder, getAllOrders, getOrdersByStatus, updateOrderStatus } from '../controllers/orderController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();


router.use(authenticateJWT)
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus)
router.get('/status/:status', getOrdersByStatus)
router.get('/', getAllOrders)

export default router;
