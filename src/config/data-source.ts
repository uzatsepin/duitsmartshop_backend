import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { Order } from '../entities/Order';
import { Cart } from '../entities/Cart';
import {Review} from "../entities/Review";
import {Wishlist} from "../entities/WishList";
import {Brand} from "../entities/Brand";
import {Banner} from "../entities/Banner";
import { OrderItem } from '../entities/OrderItem';
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [User, Role, Product, Category, Order, Cart, Review, Wishlist, Brand, Banner, OrderItem],
});
