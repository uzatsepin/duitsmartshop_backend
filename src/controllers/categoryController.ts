import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Category } from '../entities/Category';
import slugify from "slugify";

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        const existingCategory = await AppDataSource.getRepository(Category).findOneBy({ name });
        if (existingCategory) {
            res.status(400).json({ message: 'Category already exists' });
            return;
        }

        const slug = slugify(name, {lower: true, locale: 'ua'})

        const category = new Category();
        category.name = name;
        category.slug = slug;

        await AppDataSource.getRepository(Category).save(category);

        res.status(201).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating category' });
    }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await AppDataSource.getRepository(Category).find();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};
