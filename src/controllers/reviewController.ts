import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Review } from '../entities/Review';
import { Product } from '../entities/Product';
import { User } from '../entities/User';

interface CustomRequest extends Request {
    user?: {
        id: number;
    };
}

export const createReview = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { productId, rating, text } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Користувач не авторизований' });
            return;
        }

        const reviewRepository = AppDataSource.getRepository(Review);
        const productRepository = AppDataSource.getRepository(Product);
        const userRepository = AppDataSource.getRepository(User);

        const product = await productRepository.findOne({ where: { id: productId } });
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!product || !user) {
            res.status(404).json({ message: 'Товар або користувач не знайдено' });
            return;
        }

        const review = reviewRepository.create({
            product,
            user,
            rating,
            text
        });

        await reviewRepository.save(review);

        const { password, ...userWithoutPassword } = user;

        res.status(201).json({
            ...review,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Помилка при створенні відгуку' });
    }
};

export const updateReview = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { rating, text } = req.body;
        const userId = req.user?.id;

        const reviewRepository = AppDataSource.getRepository(Review);
        const review = await reviewRepository.findOne({
            where: { id: parseInt(id), user: { id: userId } }
        });

        if (!review) {
            res.status(404).json({ message: 'Відгук не знайдено' });
            return;
        }

        review.rating = rating;
        review.text = text;

        await reviewRepository.save(review);
        res.status(200).json(review);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Помилка при оновленні відгуку' });
    }
};

export const deleteReview = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const reviewRepository = AppDataSource.getRepository(Review);
        const review = await reviewRepository.findOne({
            where: { id: parseInt(id), user: { id: userId } }
        });

        if (!review) {
            res.status(404).json({ message: 'Відгук не знайдено' });
            return;
        }

        await reviewRepository.remove(review);
        res.status(200).json({ message: 'Відгук видалено' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Помилка при видаленні відгуку' });
    }
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const reviewRepository = AppDataSource.getRepository(Review);

        const reviews = await reviewRepository.find({
            where: { product: { id: parseInt(productId) } },
            relations: ['user'],
            order: { created: 'DESC' }
        });

        const reviewsWithUserDetails = reviews.map(review => {
            const { password, ...userWithoutPassword } = review.user;
            return {
                ...review,
                user: userWithoutPassword
            };
        });

        res.status(200).json(reviewsWithUserDetails);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Помилка при отриманні відгуків' });
    }
};

export const likeReview = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const reviewRepository = AppDataSource.getRepository(Review);
        const review = await reviewRepository.findOne({
            where: { id: parseInt(id) }
        });

        if (!review) {
            res.status(404).json({ message: 'Відгук не знайдено' });
            return;
        }

        review.likes = (review.likes || 0) + 1;

        await reviewRepository.save(review);
        res.status(200).json(review);
    } catch (error) {
        console.error('Error liking review:', error);
        res.status(500).json({ message: 'Помилка при лайку відгуку' });
    }
};

export const getUserReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const reviewRepository = AppDataSource.getRepository(Review);

        const reviews = await reviewRepository.find({
            where: { user: { id: parseInt(userId) } },
            relations: ['product'],
            order: { created: 'DESC' }
        });

        const reviewsWithProductDetails = reviews.map(review => {
            return {
                ...review,
                product: {
                    id: review.product.id,
                    name: review.product.name,
                    slug: review.product.slug,
                    imageUrl: review.product.imageUrl
                }
            };
        });

        res.status(200).json(reviewsWithProductDetails);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ message: 'Помилка при отриманні відгуків користувача' });
    }
};