import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from './Product';
import { User } from './User';

@Entity()
export class Wishlist {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.wishlist, { onDelete: 'CASCADE' })
    user!: User;

    @ManyToOne(() => Product, (product) => product.wishlist, { onDelete: 'CASCADE' })
    product!: Product;
}
