import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Role } from '../entities/Role';

export const createRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        const existingRole = await AppDataSource.getRepository(Role).findOneBy({ name });
        if (existingRole) {
            res.status(400).json({ message: 'Role already exists' });
            return;
        }

        const role = new Role();
        role.name = name;

        await AppDataSource.getRepository(Role).save(role);

        res.status(201).json({ message: 'Role created successfully', role });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
