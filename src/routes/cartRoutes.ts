// cartRoutes.ts
import { Router } from 'express';
import { 
    getCart, 
    addToCart, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart
} from '../controllers/cartController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:cartItemId', updateCartItemQuantity);
router.delete('/item/:cartItemId', removeFromCart);
router.delete('/clear', clearCart);

export default router;