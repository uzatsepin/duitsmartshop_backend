import express from 'express';
import { 
    createReview, 
    updateReview, 
    deleteReview, 
    getProductReviews, 
    likeReview,
    getUserReviews
} from '../controllers/reviewController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/:id/like', likeReview)

router.use(authenticateJWT);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.get('/user/:userId', getUserReviews);

export default router;