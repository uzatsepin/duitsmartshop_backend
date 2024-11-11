import { Request, Response } from 'express';
import slugify from 'slugify';
import { AppDataSource } from '../config/data-source';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, description, categoryId, oldPrice, brand, warranty, credit, quantity, createdBy, article, characteristics } = req.body;

        const category = await AppDataSource.getRepository(Category).findOneBy({ id: parseInt(categoryId) });
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        const slug = slugify(name, { lower: true, locale: 'ua' });

        const product = new Product();
        product.name = name;
        product.price = price;
        product.description = description;
        product.category = category;
        product.oldPrice = oldPrice;
        product.brand = brand;
        product.slug = slug;
        product.warranty = warranty || null;
        product.credit = credit || null;
        product.quantity = quantity || 0;
        product.isInStock = quantity > 0;
        product.createdBy = createdBy || null;
        product.article = article || null;

        const imageUrl = req.file?.path;
        if (imageUrl) {
            product.imageUrl = imageUrl;
        } else {
            console.warn('Image not uploaded');
        }

        // Проверка, что characteristics является массивом объектов с полями name и value
        const parsedCharacteristics = JSON.parse(characteristics);
        if (!Array.isArray(parsedCharacteristics) || !parsedCharacteristics.every(char => char.name && char.value)) {
            res.status(400).json({ message: 'Characteristics must be an array of objects with name and value' });
            return;
        }

        product.characteristics = parsedCharacteristics;

        await AppDataSource.getRepository(Product).save(product);

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product', error: JSON.stringify(error) });
    }
};


export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await AppDataSource.getRepository(Product).find({
            relations: ['category', 'brand', 'createdBy', 'reviews'],
        });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const productRepository = AppDataSource.getRepository(Product);
        
        const product = await productRepository.findOne({
            where: { id: parseInt(id, 10) },
            relations: ['category', 'reviews'],
        });

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        product.views = (product.views || 0) + 1;
        await productRepository.save(product);

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Error fetching product by ID' });
    }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;

        const category = await AppDataSource.getRepository(Category).findOne({
            where: { id: parseInt(categoryId, 10) }
        });

        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        const products = await AppDataSource.getRepository(Product).find({
            where: { category: { id: category.id } },
            relations: ['category', 'brand', 'reviews'],
        });

        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Error fetching products by category' });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const productRepository = AppDataSource.getRepository(Product);
        
        const product = await productRepository.findOne({
            where: { id: parseInt(id, 10) }
        });

        if (!product) {
            res.status(404).json({ message: 'Товар не знайдено' });
            return;
        }

        await productRepository.remove(product);

        res.status(200).json({ message: 'Товар успішно видалено' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Помилка при видаленні товару' });
    }
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = req.query.query as string;
        
        if (!query) {
            res.status(400).json({ message: 'Query parameter is required' });
            return;
        }

        const productRepository = AppDataSource.getRepository(Product);
        
        const products = await productRepository
            .createQueryBuilder('product')
            .where('LOWER(product.name) LIKE LOWER(:query)', { query: `%${query}%` })
            .leftJoinAndSelect('product.category', 'category')
            .take(5)
            .getMany();

        res.status(200).json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Error searching products' });
    }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;
        const productRepository = AppDataSource.getRepository(Product);
        
        const product = await productRepository
            .createQueryBuilder('product')
            .where('product.slug = :slug', { slug })
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.brand', 'brand')
            .leftJoinAndSelect('product.reviews', 'reviews')
            .leftJoinAndSelect('reviews.user', 'user')
            .getOne();

        if (!product) {
            res.status(404).json({ message: 'Товар не знайдено' });
            return;
        }

        const transformedProduct = {
            ...product,
            reviews: product.reviews.map(review => {
                const { password, ...userWithoutPassword } = review.user;
                return {
                    ...review,
                    user: userWithoutPassword
                };
            })
        };

        product.views = (product.views || 0) + 1;
        await productRepository.save(product);

        res.status(200).json(transformedProduct);
    } catch (error) {
        console.error('Error fetching product by slug:', error);
        res.status(500).json({ message: 'Помилка при отриманні товару' });
    }
};

export const getProductByBrand = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;
        const products = await AppDataSource.getRepository(Product).find({
            where: { brand: { slug: slug } },
            relations: ['brand', 'reviews'],
        });
        if (products.length === 0) {
            res.status(404).json({ message: 'Для цього бренду товари не знайдені' });
            return;
    }
        res.status(200).json(products);
    } catch (error) {
        console.error('Помилка при отриманні товарів:', error);
        res.status(500).json({ message: 'Помилка при отриманні товарів бренду' });
    }
};