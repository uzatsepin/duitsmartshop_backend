import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { QueryRunner } from 'typeorm';
import { Order } from '../entities/Order';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { OrderItem } from '../entities/OrderItem';

interface CustomRequest extends Request {
    user?: {
        id: number;
        roleId: number;
    };
}

const userRoles = {
    ADMIN: 1,
    CUSTOMER: 2,
    CONTENT: 3
}

export const createOrder = async (req: CustomRequest, res: Response): Promise<void> => {
    const queryRunner: QueryRunner = AppDataSource.createQueryRunner();

    try {
        const { totalAmount, items } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Користувач не авторизований' });
            return;
        }

        // Начинаем транзакцию
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const userRepository = queryRunner.manager.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            await queryRunner.rollbackTransaction();
            res.status(404).json({ message: 'Користувача не знайдено' });
            return;
        }

        const orderRepository = queryRunner.manager.getRepository(Order);
        const productRepository = queryRunner.manager.getRepository(Product);

        // Проверка и обновление количества продуктов
        const orderItems: OrderItem[] = [];

        for (const item of items) {
            const product = await productRepository.findOne({ where: { id: item.productId } });

            if (!product) {
                await queryRunner.rollbackTransaction();
                res.status(404).json({ message: `Товар з id ${item.productId} не знайдено` });
                return;
            }

            if (product.quantity < item.quantity) {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ message: `Недостатня кількість товару: ${product.name}` });
                return;
            }

            // Уменьшаем количество товара
            product.quantity -= item.quantity;
            await productRepository.save(product);

            // Создаем элемент заказа
            const orderItem = new OrderItem();
            orderItem.product = product;
            orderItem.quantity = item.quantity;
            orderItem.price = product.price * item.quantity;
            orderItems.push(orderItem);
        }

        // Создаем заказ
        const order = new Order();
        order.orderDate = new Date();
        order.user = user;
        order.totalAmount = totalAmount;
        order.status = 'new';
        order.items = orderItems;

        await orderRepository.save(order);

        // Завершаем транзакцию
        await queryRunner.commitTransaction();

        // Убираем поле password из пользователя перед отправкой
        const { password, ...userWithoutPassword } = user;

        res.status(201).json({
            ...order,
            user: userWithoutPassword
        });
    } catch (error) {
        // В случае ошибки откатываем транзакцию
        await queryRunner.rollbackTransaction();
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Помилка при створенні замовлення' });
    } finally {
        // Освобождаем ресурсы
        await queryRunner.release();
    }
};

export const updateOrderStatus = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userRole = req.user?.roleId;

        if (userRole !== userRoles.ADMIN) {
            res.status(403).json({ message: 'Доступ заборонено' });
            return;
        }

        const orderRepository = AppDataSource.getRepository(Order);
        const order = await orderRepository.findOne({
            where: { id: parseInt(id) },
            relations: ['user', 'items', 'items.product']
        });

        if (!order) {
            res.status(404).json({ message: 'Замовлення не знайдено' });
            return;
        }

        const validStatuses = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: 'Недійсний статус замовлення' });
            return;
        }

        order.status = status;
        await orderRepository.save(order);

        const { password, ...userWithoutPassword } = order.user;

        res.status(200).json({
            ...order,
            user: userWithoutPassword,
            orderProducts: order.items
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Помилка при оновленні статусу замовлення' });
    }
};

export const getOrdersByStatus = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.params;

        const orderRepository = AppDataSource.getRepository(Order);
        const orders = await orderRepository.find({
            where: { status: status as 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' },
            relations: ['user'],
            order: { orderDate: 'DESC' }
        });

        const ordersWithoutPassword = orders.map(order => {
            const { password, ...userWithoutPassword } = order.user;
            return {
                ...order,
                user: userWithoutPassword
            };
        });

        res.status(200).json(ordersWithoutPassword);
    } catch (error) {
        console.error('Error fetching orders by status:', error);
        res.status(500).json({ message: 'Помилка при отриманні замовлень' });
    }
};

export const getAllOrders = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.roleId;        

        const orderRepository = AppDataSource.getRepository(Order);

        let orders;
        if (userRole === userRoles.ADMIN) {
            orders = await orderRepository.find({
                relations: ['user', 'items', 'items.product'],
                order: { orderDate: 'DESC' }
            });
        } else {
            orders = await orderRepository.find({
                where: { user: { id: userId } },
                relations: ['user', 'product', 'items', 'items.product'],
                order: { orderDate: 'DESC' }
            });
        }

        const ordersWithoutPassword = orders.map(order => {
            const { password, ...userWithoutPassword } = order.user;
            return {
                ...order,
                user: userWithoutPassword,
                orderProducts: order.items
            };
        });

        res.status(200).json(ordersWithoutPassword);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Помилка при отриманні замовлень' });
    }
};
