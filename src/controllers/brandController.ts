import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Brand } from '../entities/Brand';
import slugify from 'slugify';

export const createBrand = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        // Проверяем, если такой бренд уже существует
        const existingBrand = await AppDataSource.getRepository(Brand).findOneBy({ name });
        if (existingBrand) {
            res.status(400).json({ message: 'Brand already exists' });
            return;
        }

        // Генерируем slug на основе имени
        const slug = slugify(name, { lower: true, locale: 'ua' });

        // Создаем новый бренд
        const brand = new Brand();
        brand.name = name;
        brand.slug = slug;

        await AppDataSource.getRepository(Brand).save(brand);

        res.status(201).json({ message: 'Brand created successfully', brand });
    } catch (error) {
        console.error('Error creating brand:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBrands = async (_req: Request, res: Response): Promise<void> => {
    try {
        const brands = await AppDataSource.getRepository(Brand).find();
        res.status(200).json(brands);
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBrandBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;
        
        const brand = await AppDataSource.getRepository(Brand).findOneBy({ slug });
        
        if (!brand) {
            res.status(404).json({ message: 'Бренд не знайдено' });
            return;
        }

        res.status(200).json(brand);
    } catch (error) {
        console.error('Помилка отримання бренду:', error);
        res.status(500).json({ message: 'Помилка серверу' });
    }
};