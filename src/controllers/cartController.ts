import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Cart } from '../entities/Cart';
import { Product } from '../entities/Product';
import { User } from '../entities/User';

interface CustomRequest extends Request {
    user?: {
        id: number;
    };
}

export const getCart = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;        

        if (!userId) {
            res.status(401).json({ message: 'Користувач не авторизований' });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({ message: 'Користувача не знайдено' });
            return;
        }

        const cartRepository = AppDataSource.getRepository(Cart);
        const cartItems = await cartRepository.find({
            where: { user: { id: userId } },
            relations: ['product', 'product.category'],
            order: { id: 'DESC' }
        });

        res.status(200).json({
            cartItems: cartItems,
            totalItems: cartItems.length,
            totalSum: cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Помилка при отриманні корзини' });
    }
};

// Добавить товар в корзину
export const addToCart = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?.id;

        const cartRepository = AppDataSource.getRepository(Cart);
        const productRepository = AppDataSource.getRepository(Product);
        const userRepository = AppDataSource.getRepository(User);

        // Проверяем существование товара
        const product = await productRepository.findOne({
            where: { id: productId }
        });

        if (!product) {
            res.status(404).json({ message: 'Товар не знайдено' });
            return;
        }

        // Проверяем существующий товар в корзине
        let cartItem = await cartRepository.findOne({
            where: {
                user: { id: userId },
                product: { id: productId }
            }
        });

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            const user = await userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                res.status(404).json({ message: 'Користувача не знайдено' });
                return;
            }

            cartItem = cartRepository.create({
                user,
                product,
                quantity
            });
        }

        await cartRepository.save(cartItem);
        res.status(200).json(cartItem);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Помилка при додаванні товару в корзину' });
    }
};

// Обновить количество товара
export const updateCartItemQuantity = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { cartItemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user?.id;

        const cartRepository = AppDataSource.getRepository(Cart);
        
        const cartItem = await cartRepository.findOne({
            where: {
                id: parseInt(cartItemId),
                user: { id: userId }
            }
        });

        if (!cartItem) {
            res.status(404).json({ message: 'Товар в корзині не знайдено' });
            return;
        }

        cartItem.quantity = quantity;
        await cartRepository.save(cartItem);

        res.status(200).json(cartItem);
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Помилка при оновленні кількості товару' });
    }
};

// Удалить товар из корзины
export const removeFromCart = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { cartItemId } = req.params;
        const userId = req.user?.id;

        const cartRepository = AppDataSource.getRepository(Cart);
        
        const cartItem = await cartRepository.findOne({
            where: {
                id: parseInt(cartItemId),
                user: { id: userId }
            }
        });

        if (!cartItem) {
            res.status(404).json({ message: 'Товар в корзині не знайдено' });
            return;
        }

        await cartRepository.remove(cartItem);
        res.status(200).json({ message: 'Товар видалено з корзини' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Помилка при видаленні товару з корзини' });
    }
};

export const clearCart = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Користувач не авторизований' });
            return;
        }

        const cartRepository = AppDataSource.getRepository(Cart);

        const cartItems = await cartRepository.find({
            where: { user: { id: userId } }
        });

        if (cartItems.length === 0) {
            res.status(200).json({ message: 'Корзина вже порожня' });
            return;
        }

        await cartRepository.remove(cartItems);

        res.status(200).json({ message: 'Корзину успішно очищено' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Помилка при очищенні корзини' });
    }
};