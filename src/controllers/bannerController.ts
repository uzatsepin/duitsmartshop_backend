import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Banner } from '../entities/Banner';
import slugify from "slugify";

export const addBanner = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;


        const slug = slugify(name, { lower: true, locale: 'ua' });

        // Создаем новый баннер
        const banner = new Banner();
        banner.name = name;
        banner.slug = slug;


        const imageUrl = req.file?.path;
        if (imageUrl) {
            banner.imageUrl = imageUrl;
        } else {
            console.warn('Image not uploaded');
            res.status(400).json({ message: 'Image is required' });
            return;
        }

        await AppDataSource.getRepository(Banner).save(banner);

        res.status(201).json(banner);
    } catch (error) {
        console.error('Error adding banner:', error);
        res.status(500).json({ message: 'Error adding banner', error: JSON.stringify(error) });
    }
};

export const getBanners = async (_req: Request, res: Response): Promise<void> => {
    try {
        const banners = await AppDataSource.getRepository(Banner).find();
        res.status(200).json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: 'Error fetching banners' });
    }
};

export const getBannerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const banner = await AppDataSource.getRepository(Banner).findOne({
            where: { id: parseInt(id, 10) }
        });

        if (!banner) {
            res.status(404).json({ message: 'Banner not found' });
            return;
        }

        res.status(200).json(banner);
    } catch (error) {
        console.error('Error fetching banner by ID:', error);
        res.status(500).json({ message: 'Error fetching banner by ID' });
    }
};
