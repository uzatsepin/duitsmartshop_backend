import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { QueryFailedError } from 'typeorm';

dotenv.config();

const JWT_SECRET = process.env.SECRET_JWT || '';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, roleId } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User();
        user.username = username;
        user.email = email;
        user.password = hashedPassword;
        user.role = roleId || 2;

        await AppDataSource.getRepository(User).save(user);

        const token = jwt.sign(
            { id: user.id, email: user.email, roleId: user.role.id },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({ message: 'User registered successfully', token, user: userWithoutPassword });
        
    } catch (error) {
        if (error instanceof QueryFailedError && error.message.includes('Duplicate entry')) {
            res.status(400).json({ message: 'Користувач з таким email вже існує' });
        } else {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await AppDataSource.getRepository(User)
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.role", "role")
            .where("user.email = :email OR user.username = :username", { email, username: email })
            .getOne();

        if (!user) {
            res.status(404).json({ message: 'Користувача не існує' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, roleId: user.role.id },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};