import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import authRoutes from "./routes/authRoutes";
import roleRoutes from "./routes/roleRoutes";
import brandRoutes from "./routes/brandRoutes";
import dotenv from 'dotenv';
import bannerRoutes from "./routes/bannerRoutes";
import cartRoutes from './routes/cartRoutes';
import reviewRoutes from './routes/reviewRoutes';
import orderRoutes from './routes/orderRoutes';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (req, res) => {
    res.send('Electronics Shop API');
});

AppDataSource.initialize().then(() => {
    console.log('Data Source has been initialized!');

    app.use('/products', productRoutes);
    app.use('/categories', categoryRoutes);
    app.use('/auth', authRoutes);
    app.use('/roles', roleRoutes);
    app.use('/brands', brandRoutes);
    app.use('/banners', bannerRoutes);
    app.use('/cart', cartRoutes);
    app.use('/review', reviewRoutes)
    app.use('/order', orderRoutes);


    app.listen(process.env.PORT, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });

}).catch((err) => {
    console.error('Error during Data Source initialization', err);
});
